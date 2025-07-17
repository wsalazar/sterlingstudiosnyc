import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient, AccessToken } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { NotFoundError } from 'rxjs'

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

  async getToken(token: string) {
    try {
      return await this.prisma.accessToken.findUniqueOrThrow({
        where: { token, isActive: true },
        select: {
          userId: true,
          galleryId: true,
          expiresAt: true,
          isActive: true,
        },
      })
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(
          "Could not find token. Either it's inactive or does not exist. Please check your spam for an email from Sterling Studios NYC."
        )
      }
      throw new Error(
        'There as an error while trying to access user token:' + error
      )
    }
  }

  async deactivateToken(token: string) {
    try {
      return await this.prisma.accessToken.update({
        where: { token, isActive: true },
        data: {
          isActive: false,
        },
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Could not find token: ' + error)
      }
      throw new Error(
        'There as an error while trying to find user token:' + error
      )
    }
  }
}
