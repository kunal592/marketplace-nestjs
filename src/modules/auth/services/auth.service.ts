import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../repositories';
import { RegisterDto, LoginDto } from '../dto';
import { hashPassword, comparePassword } from '../../../helpers/hash.helper';
import { generateToken } from '../../../helpers/jwt.helper';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly authRepository: AuthRepository,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.authRepository.findUserByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(registerDto.password);

        // Create user
        const user = await this.authRepository.createUser({
            ...registerDto,
            password: hashedPassword,
        });

        // Generate token
        const token = this.generateJwtToken(user.id, user.role);

        this.logger.log(`New user registered: ${user.email}`);

        return { user, token };
    }

    async login(loginDto: LoginDto) {
        // Find user by email
        const user = await this.authRepository.findUserByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await comparePassword(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Generate token
        const token = this.generateJwtToken(user.id, user.role);

        this.logger.log(`User logged in: ${user.email}`);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
            token,
        };
    }

    async getProfile(userId: string) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }

    private generateJwtToken(userId: string, role: string): string {
        const secret = this.configService.get<string>('jwt.secret')!;
        const expiresIn = this.configService.get<string>('jwt.expiresIn', '7d');

        return generateToken({ userId, role }, secret, expiresIn);
    }
}
