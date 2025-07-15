import { Injectable } from '@nestjs/common'
import { PrismaClient, AccessToken } from '@prisma/client'

@Injectable()
export class AccessTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async save(tokenData: {
    token: string
    galleryId: string
    userId: string
    expiresAt: Date
    isActive: boolean
  }): Promise<AccessToken> {
    /**
     * add a try catch block here
     */
    return await this.prisma.accessToken.create({
      data: tokenData,
    })
  }
}
