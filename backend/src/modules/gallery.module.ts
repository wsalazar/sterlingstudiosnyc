import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GalleryController } from '../controllers/gallery.controller'
import { GalleryRepository } from '../repositories/gallery.repository'
import { PrismaService } from '../services/prisma.service'
import { PrismaClient } from '@prisma/client'

@Module({
  imports: [ConfigModule],
  controllers: [GalleryController],
  providers: [GalleryRepository, PrismaService, PrismaClient],
  exports: [GalleryRepository, PrismaClient],
})
export class GalleryModule {}
