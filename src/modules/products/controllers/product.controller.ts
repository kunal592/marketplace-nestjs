import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from '../services/product.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../dto/product.dto';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get()
    async findAll(@Query() query: ProductQueryDto) {
        return this.productService.findAll(query);
    }

    @Get(':slug')
    async findBySlug(@Param('slug') slug: string) {
        return this.productService.findBySlug(slug);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.VENDOR)
    async create(
        @CurrentUser() user: { id: string; vendor: { id: string } },
        @Body() dto: CreateProductDto,
    ) {
        return this.productService.create(user.vendor.id, dto);
    }

    @Post('bulk-upload')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.VENDOR)
    @UseInterceptors(FileInterceptor('file'))
    async bulkUpload(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: { id: string; vendor: { id: string } }
    ) {
        if (!file) throw new BadRequestException('CSV file is required');
        return this.productService.bulkUpload(user.vendor.id, file.buffer);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.VENDOR)
    async update(
        @Param('id') id: string,
        @CurrentUser() user: { id: string; vendor: { id: string } },
        @Body() dto: UpdateProductDto,
    ) {
        return this.productService.update(id, user.vendor.id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.VENDOR)
    async delete(
        @Param('id') id: string,
        @CurrentUser() user: { id: string; vendor: { id: string } },
    ) {
        return this.productService.delete(id, user.vendor.id);
    }
}
