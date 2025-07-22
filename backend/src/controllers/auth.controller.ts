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
import { EmailService } from '@/services/email.service'

@Controller('v1/auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService
  ) {}

  @Public()
  @Post('user')
  async createUser(
    @Body()
    userData: {
      email: string
      password: string
      name: string
      admin: boolean
    }
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
          admin: userData.admin,
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
      await this.emailService.sendEmail({
        from: this.configService.get<string>('email.user'),
        to: userData.email,
        subject: 'Welcome to Sterling Studios NYC',
        html: `<img
                src="/assets/images/Logo_Final2022.jpg"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
              /><h1>Welcome ${userData.name}</h1><br />The admin has been sent an email.`,
        text: `Welcome ${userData.name}\nThe admin has been sent an email.`,
      })

      await this.emailService.sendEmail({
        from: this.configService.get<string>('email.user'),
        to: this.configService.get<string>('email.user'),
        subject: 'No Reply',
        html: `<img
                src="/assets/images/Logo_Final2022.jpg"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
              />${userData.name} has just joined. Please login to your account and assign his gallery.`,
        text: `${userData.name} has just joined. Please login to your account and assign his gallery.`,
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
  ): Promise<Response> {
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
      const { email, name, admin } = user

      const responseData = {
        user: {
          email,
          name,
          admin,
        },
        success: true,
      }

      return response
        .status(200)
        .json({ message: 'Success', data: responseData })
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
