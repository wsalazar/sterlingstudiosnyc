import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  generateTokens(payload: any) {
    const accessSecret = this.configService.get<string>('token.secret')
    const refreshSecret = this.configService.get<string>('token.refreshSecret')

    console.log('Generating tokens with secrets:', {
      accessSecret: !!accessSecret,
      refreshSecret: !!refreshSecret,
    })

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: '5m', // Match cookie expiration
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7m', // Match cookie expiration
    })
    console.log('Acess Token:', accessToken)
    console.log('Refresh Token:', refreshToken)

    console.log('Generated tokens:', {
      accessToken: accessToken ? 'present' : 'missing',
      refreshToken: refreshToken ? 'present' : 'missing',
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length,
    })
    /**
     * When the client presents the refresh token (e.g., to /auth/refresh endpoint), verify it using the same secret:
     * const payload = this.jwtService.verify(refreshToken, {
  secret: process.env.JWT_REFRESH_SECRET,
});
     */

    return { accessToken, refreshToken }
  }
}
