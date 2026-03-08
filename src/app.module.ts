import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { PayoutsModule } from './modules/payouts/payouts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // ── Configuration ──
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    // ── Database ──
    PrismaModule,

    // ── Feature Modules ──
    AuthModule,
    UsersModule,
    VendorsModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    WalletsModule,
    PayoutsModule,
    ReviewsModule,
    AdminModule,
  ],
})
export class AppModule { }
