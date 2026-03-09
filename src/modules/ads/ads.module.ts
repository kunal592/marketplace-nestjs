import { Global, Module } from '@nestjs/common';
import { AdsController } from './controllers/ads.controller';
import { AdsService } from './services/ads.service';

@Global()
@Module({
    controllers: [AdsController],
    providers: [AdsService],
    exports: [AdsService],
})
export class AdsModule { }
