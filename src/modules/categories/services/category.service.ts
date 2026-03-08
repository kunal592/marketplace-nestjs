import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { generateSlug } from '../../../utils/slug.util';

@Injectable()
export class CategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    async findAll() {
        return this.categoryRepository.findAll();
    }

    async create(dto: CreateCategoryDto) {
        const slug = generateSlug(dto.name);
        return this.categoryRepository.create({
            name: dto.name,
            slug,
            parentId: dto.parentId,
        });
    }

    async update(id: string, dto: UpdateCategoryDto) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const updateData: Record<string, string | undefined> = {};
        if (dto.name) {
            updateData.name = dto.name;
            updateData.slug = generateSlug(dto.name);
        }
        if (dto.parentId !== undefined) {
            updateData.parentId = dto.parentId;
        }

        return this.categoryRepository.update(id, updateData);
    }

    async delete(id: string) {
        const category = await this.categoryRepository.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return this.categoryRepository.delete(id);
    }
}
