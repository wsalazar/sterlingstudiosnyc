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
import { Response, Request } from 'express'
import { AuthService } from '@/services/auth.service'

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string }
}

@Controller('v1/auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService
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
  ): Promise<{
    user: object
    success: boolean
    accessToken?: string
    refreshToken?: string
  }> {
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

      const { accessToken, refreshToken } =
        this.authService.generateTokens(payload)
      console.log('login tokens received:', {
        accessToken: accessToken ? 'present' : 'missing',
        refreshToken: refreshToken ? 'present' : 'missing',
      })

      // Same-origin settings for proxy
      const cookieOptions = {
        httpOnly: true,
        secure: false, // Allow HTTP for localhost
        sameSite: 'lax' as const, // Same-origin requests
        path: '/',
      }

      console.log('Cookie settings:', cookieOptions)

      response.cookie('sterling_session', accessToken, {
        ...cookieOptions,
        // maxAge: 60000, // 1 minute in milliseconds
        maxAge: 300000,
      })

      response.cookie('sterling_session_restart', refreshToken, {
        ...cookieOptions,
        // maxAge: 120000, // 2 minutes in milliseconds
        maxAge: 420000,
      })

      console.log('Cookies set:', {
        sterling_session: !!accessToken,
        sterling_session_restart: !!refreshToken,
      })

      // Log the actual response headers
      console.log('Response headers being set:', response.getHeaders())

      return {
        user: {
          email: user.email,
          name: user.name,
          admin: user.admin,
        },
        success: true,
        // Temporary: include tokens in response for debugging
        accessToken,
        refreshToken,
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('me')
  async getMe(@Req() req: AuthenticatedRequest): Promise<{
    email: string
    name: string
    admin: boolean
    success: boolean
  }> {
    console.log('cookies', req.cookies)
    console.log('req user', req.user)
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
  @Post('refresh')
  async refresh(@Req() req: Request & { cookies: any }, @Res() res: Response) {
    console.log('Refresh endpoint called')
    console.log('Request headers:', req.headers)
    console.log('Request URL:', req.url)
    console.log('All cookies received:', req.cookies)
    console.log('Cookie header:', req.headers.cookie)
    const refreshToken = req.cookies['sterling_session_restart']
    console.log(
      'refresh token extracted:',
      refreshToken ? 'present' : 'missing'
    )
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token was provided' })
    }
    try {
      const refreshSecret = this.configService.get<string>(
        'token.refreshSecret'
      )
      const accessSecret = this.configService.get<string>('token.secret')
      console.log('refresh secret', refreshSecret)
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      })
      console.log('payload', payload)
      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
        },
        { secret: accessSecret, expiresIn: '15m' }
      )
      console.log('newAccessToken', newAccessToken)

      // Set the new access token as a cookie
      res.cookie('sterling_session', newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 300000, // 5 minutes
      })

      return res.json({ accessToken: newAccessToken })
    } catch (error) {
      console.log('error Invalid refresh token', error)

      return res.status(401).json({ message: 'Invalid refresh token' })
    }
  }

  @Public()
  @Get('test-cookies')
  async testCookies(
    @Req() req: Request & { cookies: any },
    @Res() res: Response
  ) {
    console.log('Test cookies endpoint called')
    console.log('Request headers:', req.headers)
    console.log('All cookies:', req.cookies)

    // Set a test cookie
    res.cookie('test_cookie', 'test_value', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    })

    return res.json({
      message: 'Test cookie set',
      receivedCookies: req.cookies,
      headers: req.headers,
    })
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
    /**
     * @todo do I need this?
     */
    response.clearCookie('sterling_session_restart', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      path: '/',
    })
    return { success: true }
  }
}
