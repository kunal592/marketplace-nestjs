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
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
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

        // Create Razorpay order
        const razorpayOrder = await this.razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100), // Razorpay expects paise
            currency: 'INR',
            receipt: orderId,
        });

        // Update payment record with Razorpay order ID
        await this.prisma.payment.update({
            where: { orderId },
            data: { razorpayOrderId: razorpayOrder.id },
        });

        this.logger.log(`Razorpay order created: ${razorpayOrder.id} for order ${orderId}`);

        return {
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: this.configService.get<string>('razorpay.keyId'),
        };
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

        // Update payment and order status
        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { orderId: dto.orderId },
                data: {
                    razorpayPaymentId: dto.razorpayPaymentId,
                    status: 'PAID',
                },
            }),
            this.prisma.order.update({
                where: { id: dto.orderId },
                data: {
                    paymentStatus: 'PAID',
                    orderStatus: 'PROCESSING',
                },
            }),
        ]);

        this.logger.log(`Payment verified for order ${dto.orderId}`);

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
