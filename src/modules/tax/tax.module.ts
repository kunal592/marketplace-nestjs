import { Module } from '@nestjs/common';
import { TaxController, AdminTaxController } from './controllers/tax.controller';
import { TaxService } from './services/tax.service';

@Module({
    controllers: [TaxController, AdminTaxController],
    providers: [TaxService],
    exports: [TaxService],
})
export class TaxModule { }
