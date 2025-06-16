import { Public } from '@/decorators/public.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { GalleryRepository } from '@/repositories/gallery.repository'
import { PrismaService } from '@/services/prisma.service'
import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Controller('v1/gallery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GalleryController {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private galleryRepository: GalleryRepository
  ) {}

  @Public()
  @Post('/')
  async createGallery(
    @Body() galleryData: { name: string; description: string }
  ) {
    return galleryData
    // this.galleryRepository.createGallery(galleryData)
  }
}
