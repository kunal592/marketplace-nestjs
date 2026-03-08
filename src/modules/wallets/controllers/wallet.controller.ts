import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletService } from '../services/wallet.service';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { Role } from '../../../common/constants';

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @Get()
    async getWallet(@CurrentUser() user: { vendor: { id: string } }) {
        return this.walletService.getWallet(user.vendor.id);
    }
}
