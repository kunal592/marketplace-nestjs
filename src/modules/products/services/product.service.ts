import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../dto/product.dto';
import { generateUniqueSlug } from '../../../utils/slug.util';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);

    constructor(
        private readonly productRepository: ProductRepository,
        private readonly prisma: PrismaService,
    ) { }

    async findAll(query: ProductQueryDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 20);

        // Build where clause
        const where: any = {
            status: 'ACTIVE',
        };

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        if (query.categoryId) {
            where.categoryId = query.categoryId;
        }

        if (query.vendorId) {
            where.vendorId = query.vendorId;
        }

        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.price = {};
            if (query.minPrice !== undefined) where.price.gte = query.minPrice;
            if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
        }

        // Build orderBy based on sort parameter
        let orderBy: any = { createdAt: 'desc' }; // default 'newest'
        if (query.sort === 'price_asc') {
            orderBy = { price: 'asc' };
        } else if (query.sort === 'price_desc') {
            orderBy = { price: 'desc' };
        } else if (query.sort === 'rating') {
            orderBy = { rating: 'desc' };
        } else if (query.sort === 'newest') {
            orderBy = { createdAt: 'desc' };
        }

        const { data, total } = await this.productRepository.findAll({
            skip,
            take,
            where,
            orderBy,
        });

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 20);
    }

    async findBySlug(slug: string) {
        const product = await this.productRepository.findBySlug(slug);
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async create(vendorId: string, dto: CreateProductDto) {
        const slug = generateUniqueSlug(dto.name);

        const productData: any = {
            name: dto.name,
            slug,
            description: dto.description,
            price: dto.price,
            discountPrice: dto.discountPrice,
            stock: dto.stock,
            images: dto.images || [],
            vendor: { connect: { id: vendorId } },
            category: { connect: { id: dto.categoryId } },
        };

        // Add variants if provided
        if (dto.variants && dto.variants.length > 0) {
            productData.variants = {
                create: dto.variants.map((v) => ({
                    sku: v.sku,
                    price: v.price,
                    stock: v.stock,
                    attributes: v.attributes || {},
                })),
            };
        }

        const product = await this.productRepository.create(productData);
        this.logger.log(`Product created: ${product.name} (${product.id})`);
        return product;
    }

    async update(productId: string, vendorId: string, dto: UpdateProductDto) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.vendorId !== vendorId) {
            throw new ForbiddenException('You can only update your own products');
        }

        const updateData: any = {};
        if (dto.name) {
            updateData.name = dto.name;
            updateData.slug = generateUniqueSlug(dto.name);
        }
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.price !== undefined) updateData.price = dto.price;
        if (dto.discountPrice !== undefined) updateData.discountPrice = dto.discountPrice;
        if (dto.stock !== undefined) updateData.stock = dto.stock;
        if (dto.images) updateData.images = dto.images;
        if (dto.categoryId) updateData.category = { connect: { id: dto.categoryId } };

        return this.productRepository.update(productId, updateData);
    }

    async delete(productId: string, vendorId: string) {
        const product = await this.productRepository.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.vendorId !== vendorId) {
            throw new ForbiddenException('You can only delete your own products');
        }

        await this.productRepository.delete(productId);
        this.logger.log(`Product deleted: ${productId}`);
        return { message: 'Product deleted successfully' };
    }

    async bulkUpload(vendorId: string, fileBuffer: Buffer) {
        try {
            const records = parse(fileBuffer, { columns: true, skip_empty_lines: true }) as any[];
            let successCount = 0;
            const errors: string[] = [];

            for (const [index, record] of records.entries()) {
                try {
                    const categorySearch = record.category ? record.category.trim() : null;
                    if (!categorySearch) {
                        throw new Error('Category is required');
                    }

                    // find category
                    const category = await this.prisma.category.findFirst({
                        where: {
                            OR: [
                                { slug: categorySearch },
                                { name: categorySearch }
                            ]
                        }
                    });

                    if (!category) {
                        throw new Error(`Category not found: ${categorySearch}`);
                    }

                    // For variant - assume it's valid JSON if provided
                    let variants = [];
                    if (record.variant) {
                        try {
                            variants = JSON.parse(record.variant);
                            if (!Array.isArray(variants)) {
                                throw new Error('Variant must be an array');
                            }
                        } catch (e) {
                            throw new Error('Invalid variant JSON format');
                        }
                    }

                    const productData = {
                        name: record.name,
                        categoryId: category.id,
                        description: record.description || undefined,
                        price: parseFloat(record.price),
                        stock: parseInt(record.stock) || 0,
                        variants: variants,
                    };

                    if (isNaN(productData.price)) throw new Error('Invalid price');

                    await this.create(vendorId, productData);
                    successCount++;
                } catch (err: any) {
                    errors.push(`Row ${index + 2}: ${err.message}`);
                }
            }

            return {
                message: 'Bulk upload completed',
                successCount,
                errorCount: errors.length,
                errors,
            };
        } catch (error: any) {
            throw new BadRequestException('Failed to process CSV: ' + error.message);
        }
    }
}
