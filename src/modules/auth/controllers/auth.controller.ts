import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services';
import { RegisterDto, LoginDto } from '../dto';
import { JwtAuthGuard } from '../../../common/guards';
import { CurrentUser } from '../../../common/decorators';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@CurrentUser('id') userId: string) {
        return this.authService.getProfile(userId);
    }
}
