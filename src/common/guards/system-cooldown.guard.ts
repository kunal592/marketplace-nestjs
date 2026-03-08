import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Request } from 'express';

@Injectable()
export class SystemCooldownGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // If it's a read operation, it's generally allowed
        if (request.method === 'GET') {
            return true;
        }

        const config = await this.prisma.systemConfig.findFirst();

        if (config?.cooldownEnabled) {
            const path = request.path;

            // Define exempt paths for mutations that are explicitly allowed in cooldown
            const exemptPrefixes = [
                '/api/cart/items', // POST, PATCH, DELETE cart items
                '/api/admin/system/cooldown', // Admin needs to toggle it off
                '/api/auth/login', // Users/Admins still need to login
                '/api/auth/register', // Registration usually isn't blocked by shopping cart, but maybe? The prompt said "block create orders etc". Let's block register unless needed, but wait: "customers may explore ... no transactional ops"
            ];

            const isExempt = exemptPrefixes.some(prefix => path.startsWith(prefix));

            if (!isExempt) {
                throw new HttpException(
                    'System is currently under maintenance. Please try again later.',
                    HttpStatus.SERVICE_UNAVAILABLE,
                );
            }
        }

        return true;
    }
}
