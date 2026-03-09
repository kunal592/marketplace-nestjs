import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles } from '../../../common/decorators';
import { Role } from '../../../common/constants';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Get()
    async getAuditLogs(@Query() query: PaginationDto) {
        return this.auditService.getAuditLogs(query);
    }
}
