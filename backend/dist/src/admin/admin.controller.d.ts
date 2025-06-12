import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AdminController {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
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
    getAllUsers(): Promise<{
        email: string;
        id: string;
        name: string;
        admin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUserById(id: string): Promise<{
        email: string;
        id: string;
        name: string;
        admin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, updateData: {
        name?: string;
        email?: string;
        admin?: boolean;
    }): Promise<{
        email: string;
        id: string;
        name: string;
        admin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteUser(id: string): Promise<{
        email: string;
        id: string;
        name: string | null;
        password: string;
        admin: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getStats(): Promise<{
        totalUsers: number;
        adminUsers: number;
        regularUsers: number;
    }>;
}
