import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class FeatureFlagService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllFlags() {
        return this.prisma.featureFlag.findMany({
            orderBy: { key: 'asc' },
        });
    }

    async getFlag(key: string) {
        let flag = await this.prisma.featureFlag.findUnique({
            where: { key },
        });

        // Automatically create flag disabled by default if it doesn't exist
        if (!flag) {
            flag = await this.prisma.featureFlag.create({
                data: { key, enabled: false, description: `Auto-generated flag for ${key}` },
            });
        }

        return flag;
    }

    async updateFlag(key: string, enabled: boolean) {
        // Ensure flag exists
        await this.getFlag(key);

        return this.prisma.featureFlag.update({
            where: { key },
            data: { enabled },
        });
    }
}
