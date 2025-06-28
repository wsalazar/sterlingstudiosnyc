import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../services/prisma.service'
import * as bcrypt from 'bcrypt'
import { Public } from '../decorators/public.decorator'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

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

  @Public()
  @Post('login')
  async login(
    @Body() loginData: { email: string; password: string },
    @Res({ passthrough: true }) response: Response
  ): Promise<{ user: object; success: boolean }> {
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

      response.cookie('sterling_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        maxAge: 3600000,
      })

      return {
        user: {
          email: user.email,
          name: user.name,
          admin: user.admin,
        },
        success: true,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('me')
  async getMe(@Req() req): Promise<{
    email: string
    name: string
    admin: boolean
    success: boolean
  }> {
    console.log(req.user.id)
    if (!req.user) throw new UnauthorizedException()
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    })
    return {
      email: user.email,
      name: user.name,
      admin: user.admin,
      success: true,
    }
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('sterling_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
    })
    return { success: true }
  }
}
