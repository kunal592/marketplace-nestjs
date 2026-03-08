import { Module } from '@nestjs/common';
import { VendorController } from './controllers/vendor.controller';
import { VendorService } from './services/vendor.service';
import { VendorRepository } from './repositories/vendor.repository';

@Module({
    controllers: [VendorController],
    providers: [VendorService, VendorRepository],
    exports: [VendorService, VendorRepository],
})
export class VendorsModule { }
