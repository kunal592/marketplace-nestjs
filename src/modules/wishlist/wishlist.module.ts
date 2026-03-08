import { Module } from '@nestjs/common';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistService } from './services/wishlist.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [WishlistController],
    providers: [WishlistService],
})
export class WishlistModule { }
