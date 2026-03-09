import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { VendorOrderController } from './controllers/vendor-order.controller';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { PaymentsModule } from '../payments/payments.module';
import { TaxModule } from '../tax/tax.module';

@Module({
    imports: [PaymentsModule, TaxModule],
    controllers: [OrderController, VendorOrderController],
    providers: [OrderService, OrderRepository],
    exports: [OrderService, OrderRepository],
})
export class OrdersModule { }

