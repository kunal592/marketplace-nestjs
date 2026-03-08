import { Module } from '@nestjs/common';
import { PayoutController } from './controllers/payout.controller';
import { PayoutService } from './services/payout.service';

@Module({
    controllers: [PayoutController],
    providers: [PayoutService],
    exports: [PayoutService],
})
export class PayoutsModule { }
