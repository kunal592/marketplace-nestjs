import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { PayoutsModule } from '../payouts/payouts.module';

import { SystemController } from './controllers/system.controller';

@Module({
    imports: [PayoutsModule],
    controllers: [AdminController, SystemController],
    providers: [AdminService],
})
export class AdminModule { }
