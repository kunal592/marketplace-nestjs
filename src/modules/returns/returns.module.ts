import { Module } from '@nestjs/common';
import { ReturnsController, VendorReturnsController } from './controllers/returns.controller';
import { ReturnsService } from './services/returns.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [PaymentsModule],
    controllers: [ReturnsController, VendorReturnsController],
    providers: [ReturnsService],
    exports: [ReturnsService],
})
export class ReturnsModule { }
