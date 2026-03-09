import { Global, Module } from '@nestjs/common';
import { FeatureFlagController } from './controllers/feature-flag.controller';
import { FeatureFlagService } from './services/feature-flag.service';

@Global()
@Module({
    controllers: [FeatureFlagController],
    providers: [FeatureFlagService],
    exports: [FeatureFlagService],
})
export class FeatureFlagsModule { }
