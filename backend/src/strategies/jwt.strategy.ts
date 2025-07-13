import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

const cookieExtractor = (req: Request): string | null => {
  console.log('=== JWT Strategy cookieExtractor ===')
  console.log('Request cookies:', req.cookies)
  console.log('Cookie header:', req.headers.cookie)

  if (req && req.cookies) {
    const token = req.cookies['sterling_session']
    console.log('Extracted token:', token ? 'present' : 'missing')
    return token
  }
  console.log('No cookies found')
  return null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('token.secret'),
    })
  }

  async validate(payload: any) {
    console.log('=== JWT Strategy validate ===')
    console.log('Payload:', payload)
    const user = { id: payload.sub, email: payload.email }
    console.log('Returning user:', user)
    return user
  }
}
