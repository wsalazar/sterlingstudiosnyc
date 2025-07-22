import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
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

  async getToken(token: string, overwrite: boolean = false) {
    try {
      const accessToken = await this.prisma.accessToken.findUnique({
        where: { token },
        select: {
          userId: true,
          galleryId: true,
          expiresAt: true,
          isActive: true,
        },
      })
      if (!accessToken) {
        throw new NotFoundException(
          "Could not find token. Either it's inactive or does not exist. Please check your spam for an email from Sterling Studios NYC."
        )
      }
      if (accessToken.isActive === false && overwrite === false) {
        throw new BadRequestException('Token has expired or is inactive.')
      }

      // // Check if expired
      if (
        accessToken.expiresAt &&
        new Date(accessToken.expiresAt) < new Date() &&
        !overwrite
      ) {
        throw new BadRequestException('Token has expired.')
      }
      return accessToken
    } catch (error) {
      throw error
    }
  }

  async getGalleryIdbyUserId(userUuid: string) {
    try {
      /**
       * @todo This query may have to add galleryId to where clause
       */
      return await this.prisma.accessToken.findFirst({
        where: { userId: userUuid },
        select: {
          galleryId: true,
        },
      })
    } catch (error) {
      throw error
    }
  }

  async deactivateToken(token: string) {
    try {
      return await this.prisma.accessToken.update({
        where: { token },
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
