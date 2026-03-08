import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../services/admin.service';

@Controller('system')
export class SystemController {
    constructor(private readonly adminService: AdminService) { }

    @Get('status')
    async getStatus() {
        return this.adminService.getCooldownStatus();
    }
}
