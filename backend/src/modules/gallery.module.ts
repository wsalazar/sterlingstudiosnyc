import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GalleryController } from '../controllers/gallery.controller'
import { GalleryRepository } from '../repositories/gallery.repository'
import { PrismaService } from '../services/prisma.service'
import { PrismaClient } from '@prisma/client'
import { DropboxService } from '../services/dropbox.service'
import { ImageService } from '@/services/image.service'
import { S3Service } from '@/services/s3.service'
import { CloudProviderService } from '@/services/cloudprovider.service'
import { UserRepository } from '@/repositories/user.repository'
import { EmailService } from '@/services/email.service'
import { AccessTokenRepository } from '@/repositories/accessToken.repository'
import { JwtService } from '@nestjs/jwt'
import { GalleryService } from '@/services/gallery.service'

@Module({
  imports: [ConfigModule],
  controllers: [GalleryController],
  providers: [
    {
      provide: 'CloudProviderService',
      inject: [ConfigService, DropboxService, S3Service],
      useFactory: (
        configService: ConfigService,
        dropboxService: DropboxService,
        s3Service: S3Service
      ) => {
        const provider = configService.get(<string>'CLOUD_PROVIDER')
        if (provider === 's3') {
          return s3Service
        }
        return dropboxService
      },
    },
    /**
     * @todo I have to find out what in the sam hill this means
     */
    {
      provide: CloudProviderService,
      useExisting: 'CloudProviderService',
    },
    DropboxService,
    S3Service,
    GalleryRepository,
    PrismaService,
    PrismaClient,
    ImageService,
    UserRepository,
    EmailService,
    AccessTokenRepository,
    JwtService,
    GalleryService,
  ],
  exports: [
    GalleryRepository,
    PrismaClient,
    UserRepository,
    AccessTokenRepository,
    JwtService,
    GalleryService,
  ],
})
export class GalleryModule {}
