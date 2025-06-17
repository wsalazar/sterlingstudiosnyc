import { Public } from '@/decorators/public.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { GalleryRepository } from '@/repositories/gallery.repository'
import { DropboxService } from '@/services/dropbox.service'
import { PrismaService } from '@/services/prisma.service'
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FilesInterceptor } from '@nestjs/platform-express'

interface GalleryImage {
  lastModified: number
  name: string
  size: number
  type: string
}

@Controller('v1/gallery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GalleryController {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private galleryRepository: GalleryRepository,
    private dropboxService: DropboxService
  ) {}

  @Public()
  @Post('/')
  @UseInterceptors(FilesInterceptor('file', 10))
  async createGallery(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    galleryData: {
      name: string
      description: string
      file: GalleryImage[]
    }
  ) {
    // Upload files to Dropbox and get URLs
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const url = await this.dropboxService.uploadFile(file)
        return { url }
      })
    )

    // Create gallery with image URLs
    const gallery = await this.galleryRepository.createGallery({
      name: galleryData.name,
      description: galleryData.description,
      images: imageUrls,
    })

    return gallery
  }

  @Public()
  @Get('/')
  async getAllGalleries() {
    return await this.galleryRepository.getAllGalleries()
  }

  @Public()
  @Get('/:id')
  async getGallery(@Param('id') id: string) {
    return await this.galleryRepository.getGallery(id)
  }

  @Public()
  @Post('/:id/images')
  @UseInterceptors(FilesInterceptor('file', 10))
  async addImagesToGallery(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    // Upload files to Dropbox and get URLs
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const url = await this.dropboxService.uploadFile(file)
        return { url }
      })
    )

    // Add images to gallery
    return await this.galleryRepository.addImagesToGallery(id, imageUrls)
  }
}
