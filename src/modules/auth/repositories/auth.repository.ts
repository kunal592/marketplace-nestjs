import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findUserByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findUserById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
                vendor: {
                    select: {
                        id: true,
                        storeName: true,
                        storeSlug: true,
                        status: true,
                    },
                },
            },
        });
    }

    async createUser(data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        role?: Role;
    }) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role || Role.CUSTOMER,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
            },
        });
    }
}
