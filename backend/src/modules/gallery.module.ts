import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GalleryController } from '../controllers/gallery.controller'
import { GalleryRepository } from '../repositories/gallery.repository'
import { PrismaService } from '../services/prisma.service'
import { PrismaClient } from '@prisma/client'
import { DropboxService } from '../services/dropbox.service'

@Module({
  imports: [ConfigModule],
  controllers: [GalleryController],
  providers: [DropboxService, GalleryRepository, PrismaService, PrismaClient],
  exports: [GalleryRepository, PrismaClient],
})
export class GalleryModule {}
