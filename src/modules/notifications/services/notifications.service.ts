import {
    Injectable,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly prisma: PrismaService) { }

    // ─── Internal: Create Notification ───────────────────────
    async createNotification(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
    ) {
        try {
            const notification = await this.prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                },
            });
            this.logger.log(`Notification created for user ${userId}: [${type}] ${title}`);
            return notification;
        } catch (error) {
            this.logger.error(`Failed to create notification for user ${userId}:`, error.message);
            throw error; // Or swallow depending on if notification failure should break flow
        }
    }

    // ─── Customer/Vendor: Get Notifications ──────────────────
    async getMyNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to 50 latest
        });
    }

    // ─── Customer/Vendor: Mark as Read ───────────────────────
    async markAsRead(userId: string, notificationId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification || notification.userId !== userId) {
            throw new NotFoundException('Notification not found');
        }

        return this.prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { message: 'All notifications marked as read' };
    }
}
