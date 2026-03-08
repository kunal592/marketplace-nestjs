import { Controller, Post, Body, Param, Headers, UseGuards, RawBody, UseInterceptors } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { VerifyPaymentDto } from '../dto/payment.dto';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';
import { IdempotencyInterceptor } from '../../../common/interceptors/idempotency.interceptor';

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('create-order/:orderId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(IdempotencyInterceptor)
    async createRazorpayOrder(
        @Param('orderId') orderId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.paymentService.createRazorpayOrder(orderId, userId);
    }

    @Post('verify')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(IdempotencyInterceptor)
    async verifyPayment(
        @Body() dto: VerifyPaymentDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.paymentService.verifyPayment(dto, userId);
    }

    @Post('webhook')
    async handleWebhook(
        @Body() body: string,
        @Headers('x-razorpay-signature') signature: string,
    ) {
        // Webhooks come from Razorpay directly — no auth guard
        return this.paymentService.handleWebhook(
            typeof body === 'string' ? body : JSON.stringify(body),
            signature,
        );
    }
}
