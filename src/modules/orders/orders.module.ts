import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { VendorOrderController } from './controllers/vendor-order.controller';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';

@Module({
    controllers: [OrderController, VendorOrderController],
    providers: [OrderService, OrderRepository],
    exports: [OrderService, OrderRepository],
})
export class OrdersModule { }
