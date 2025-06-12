"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let AdminController = class AdminController {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async createAdminUser(userData) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: userData.email },
            });
            if (existingUser) {
                throw new common_1.HttpException('User with this email already exists', common_1.HttpStatus.CONFLICT);
            }
            const saltRounds = this.configService.get('auth.saltRounds');
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            const newUser = await this.prisma.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    admin: true,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    admin: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            return newUser;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Failed to create admin user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                admin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async getUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                admin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async updateUser(id, updateData) {
        return this.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                admin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async deleteUser(id) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
    async getStats() {
        const totalUsers = await this.prisma.user.count();
        const adminUsers = await this.prisma.user.count({
            where: { admin: true },
        });
        return {
            totalUsers,
            adminUsers,
            regularUsers: totalUsers - adminUsers,
        };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createAdminUser", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('v1/admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map