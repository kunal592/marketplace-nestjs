import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../dto/product.dto';
import { generateUniqueSlug } from '../../../utils/slug.util';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
    private readonly logger = new Logger(ProductService.name);

    constructor(private readonly productRepository: ProductRepository) { }

    async findAll(query: ProductQueryDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 20);

        // Build where clause
        const where: Prisma.ProductWhereInput = {
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
        let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // default 'newest'
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

        const productData: Prisma.ProductCreateInput = {
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

        const updateData: Prisma.ProductUpdateInput = {};
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
}
