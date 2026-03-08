import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { PayoutsModule } from '../payouts/payouts.module';

@Module({
    imports: [PayoutsModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }
