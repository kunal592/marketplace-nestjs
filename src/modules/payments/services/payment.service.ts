import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import { VerifyPaymentDto } from '../dto/payment.dto';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from '../../../helpers/payment.helper';
import Razorpay = require('razorpay');

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly razorpay: InstanceType<typeof Razorpay>;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.razorpay = new Razorpay({
            key_id: this.configService.get<string>('razorpay.keyId', ''),
            key_secret: this.configService.get<string>('razorpay.secret', ''),
        });
    }

    async createRazorpayOrder(orderId: string, userId: string) {
        return this.prisma.$transaction(async (tx: any) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    payment: true,
                    vendorOrders: {
                        include: { items: true },
                    },
                },
            });

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            if (order.userId !== userId) {
                throw new BadRequestException('Access denied');
            }

            if (order.paymentStatus === 'PAID') {
                throw new BadRequestException('Order is already paid');
            }

            if (order.payment?.razorpayOrderId) {
                return {
                    razorpayOrderId: order.payment.razorpayOrderId,
                    amount: Math.round(order.totalAmount * 100),
                    currency: 'INR',
                    keyId: this.configService.get<string>('razorpay.keyId'),
                };
            }

            // Consolidate order items to validate and reserve
            for (const vendorOrder of order.vendorOrders) {
                for (const item of vendorOrder.items) {
                    // Lock product row for safe read
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                    });

                    if (!product || product.status !== 'ACTIVE') {
                        throw new BadRequestException(`Product unavailable`);
                    }

                    // Check if variant exists and lock it
                    let availableStock = product.stock;
                    if (item.variantId) {
                        const variant = await tx.productVariant.findUnique({
                            where: { id: item.variantId },
                        });
                        if (variant) availableStock = variant.stock;
                    }

                    if (availableStock < item.quantity) {
                        throw new BadRequestException(`Insufficient stock for product ID: ${item.productId}`);
                    }

                    // Create stock reservation
                    await tx.stockReservation.create({
                        data: {
                            productId: item.productId,
                            variantId: item.variantId,
                            userId: order.userId,
                            quantity: item.quantity,
                            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
                        },
                    });

                    // Reduce stock temporarily
                    if (item.variantId) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { decrement: item.quantity } },
                        });
                    } else {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { decrement: item.quantity } },
                        });
                    }
                }
            }

            // Create Razorpay order
            const razorpayOrder = await this.razorpay.orders.create({
                amount: Math.round(order.totalAmount * 100), // Razorpay expects paise
                currency: 'INR',
                receipt: orderId,
            });

            // Update payment record with Razorpay order ID
            await tx.payment.update({
                where: { orderId },
                data: { razorpayOrderId: razorpayOrder.id },
            });

            this.logger.log(`Razorpay order created: ${razorpayOrder.id} for order ${orderId} with stock reservation`);

            return {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: this.configService.get<string>('razorpay.keyId'),
            };
        });
    }

    async verifyPayment(dto: VerifyPaymentDto, userId: string) {
        const secret = this.configService.get<string>('razorpay.secret', '');

        // Verify signature
        const isValid = verifyRazorpaySignature(
            dto.razorpayOrderId,
            dto.razorpayPaymentId,
            dto.razorpaySignature,
            secret,
        );

        if (!isValid) {
            this.logger.warn(`Invalid payment signature for order ${dto.orderId}`);
            throw new BadRequestException('Invalid payment signature');
        }

        // Update payment and order status and complete reservations
        await this.prisma.$transaction(async (tx: any) => {
            const paymentUpdate = await tx.payment.update({
                where: { orderId: dto.orderId },
                data: {
                    razorpayPaymentId: dto.razorpayPaymentId,
                    status: 'PAID',
                },
            });

            const orderUpdate = await tx.order.update({
                where: { id: dto.orderId },
                data: {
                    paymentStatus: 'PAID',
                    orderStatus: 'PROCESSING',
                },
            });

            await tx.stockReservation.updateMany({
                where: {
                    userId,
                    status: 'ACTIVE',
                },
                data: {
                    status: 'COMPLETED',
                },
            });

            return { paymentUpdate, orderUpdate };
        });

        this.logger.log(`Payment verified and stock locked for order ${dto.orderId}`);

        return { message: 'Payment verified successfully' };
    }

    async handleWebhook(body: string, signature: string) {
        const webhookSecret = this.configService.get<string>('razorpay.webhookSecret', '');

        const isValid = verifyRazorpayWebhookSignature(body, signature, webhookSecret);

        if (!isValid) {
            this.logger.warn('Invalid webhook signature');
            throw new BadRequestException('Invalid webhook signature');
        }

        const event = JSON.parse(body);

        switch (event.event) {
            case 'payment.captured': {
                const paymentEntity = event.payload?.payment?.entity;
                if (paymentEntity) {
                    await this.prisma.payment.updateMany({
                        where: { razorpayOrderId: paymentEntity.order_id },
                        data: {
                            razorpayPaymentId: paymentEntity.id,
                            status: 'PAID',
                        },
                    });
                    this.logger.log(`Webhook: Payment captured ${paymentEntity.id}`);
                }
                break;
            }
            case 'payment.failed': {
                const paymentEntity = event.payload?.payment?.entity;
                if (paymentEntity) {
                    await this.prisma.payment.updateMany({
                        where: { razorpayOrderId: paymentEntity.order_id },
                        data: { status: 'FAILED' },
                    });
                    this.logger.log(`Webhook: Payment failed for ${paymentEntity.order_id}`);
                }
                break;
            }
            default:
                this.logger.log(`Webhook: Unhandled event ${event.event}`);
        }

        return { received: true };
    }
}
