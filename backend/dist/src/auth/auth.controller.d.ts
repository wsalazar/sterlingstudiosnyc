import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    createAdminUser(userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<{
        email: string;
        id: string;
        name: string;
        admin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginData: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            admin: boolean;
        };
    }>;
}
