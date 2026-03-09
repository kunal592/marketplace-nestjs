import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { buildPaginatedResult, getPaginationOffset } from '../../../utils/pagination.util';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    async logAction(userId: string | null, action: string, entityType: string, entityId: string, metadata: any = {}) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    entityType,
                    entityId,
                    metadata: metadata || {}
                }
            });
        } catch (error: any) {
            this.logger.error(`Failed to create audit log for ${action} on ${entityType} ${entityId}: ${error.message}`);
        }
    }

    async getAuditLogs(query: PaginationDto) {
        const { skip, take } = getPaginationOffset(query.page || 1, query.limit || 50);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            this.prisma.auditLog.count()
        ]);

        return buildPaginatedResult(data, total, query.page || 1, query.limit || 50);
    }
}
