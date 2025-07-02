import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from '../decorators/roles.decorator'
import { PrismaService } from '../services/prisma.service'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { Public } from '../decorators/public.decorator'

@Controller('v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  @Public()
  @Post('user')
  async createAdminUser(
    @Body() userData: { email: string; password: string; name: string }
  ) {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (existingUser) {
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.CONFLICT
        )
      }

      // Hash the password
      const saltRounds = this.configService.get<number>('auth.saltRounds')
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

      // Create the admin user
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
      })

      return newUser
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Failed to create admin user:' + error,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Get('users')
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
    })
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
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
    })
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: { name?: string; email?: string; admin?: boolean }
  ) {
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
    })
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.prisma.user.delete({
      where: { id },
    })
  }

  @Get('stats')
  async getStats() {
    const totalUsers = await this.prisma.user.count()
    const adminUsers = await this.prisma.user.count({
      where: { admin: true },
    })

    return {
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
    }
  }
}
