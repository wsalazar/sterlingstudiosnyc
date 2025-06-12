import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { Public } from '../auth/decorators/public.decorator'
import { ConfigService } from '@nestjs/config'
import { privateDecrypt } from 'crypto'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
          admin: false,
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
        'Failed to create admin user',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginData.email },
      })

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      }

      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
      )

      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED)
      }

      const payload = { email: user.email, sub: user.id }
      const token = this.jwtService.sign(payload)

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          admin: user.admin,
        },
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
