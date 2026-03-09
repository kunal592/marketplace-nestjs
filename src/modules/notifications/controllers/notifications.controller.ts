import {
    Controller, Get, Patch, Param, UseGuards,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getMyNotifications(@CurrentUser('id') userId: string) {
        return this.notificationsService.getMyNotifications(userId);
    }

    @Patch('read-all')
    async markAllAsRead(@CurrentUser('id') userId: string) {
        return this.notificationsService.markAllAsRead(userId);
    }

    @Patch(':id/read')
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.notificationsService.markAsRead(userId, id);
    }
}
