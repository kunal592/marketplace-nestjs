import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreService } from '../services/store.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Controller('stores')
export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    @Get(':slug')
    async getStoreData(@Param('slug') slug: string) {
        return this.storeService.getStoreBySlug(slug);
    }

    @Get(':slug/products')
    async getStoreProducts(
        @Param('slug') slug: string,
        @Query() query: PaginationDto,
    ) {
        return this.storeService.getStoreProducts(slug, query);
    }
}
