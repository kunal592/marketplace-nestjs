import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Access token is missing');
        }

        try {
            const secret = this.configService.get<string>('jwt.secret');
            const payload = jwt.verify(token, secret!) as { userId: string; role: string };

            const user = await this.prisma.user.findUnique({
                where: { id: payload.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    phone: true,
                    vendor: {
                        select: {
                            id: true,
                            status: true,
                        },
                    },
                },
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            request.user = user;
            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    private extractTokenFromHeader(request: { headers: { authorization?: string } }): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
