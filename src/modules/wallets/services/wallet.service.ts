import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class WalletService {
    constructor(private readonly prisma: PrismaService) { }

    async getWallet(vendorId: string) {
        const wallet = await this.prisma.vendorWallet.findUnique({
            where: { vendorId },
        });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        return wallet;
    }
}
