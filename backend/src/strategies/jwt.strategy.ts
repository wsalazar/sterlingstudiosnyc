import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['sterling_session']
  }
  return null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtSecret'),
    })
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email }
  }
}
