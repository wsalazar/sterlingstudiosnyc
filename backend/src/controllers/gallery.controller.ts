import { Public } from '@/decorators/public.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { GalleryRepository } from '@/repositories/gallery.repository'
import { DropboxService } from '@/services/dropbox.service'
import { ImageService } from '@/services/image.service'
import { PrismaService } from '@/services/prisma.service'
import { sanitizeFilename } from '@/utils/helper'
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
    private dropboxService: DropboxService,
    private imageService: ImageService
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
    try {
      // Upload files to Dropbox and get URLs
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          const image = await this.imageService.createLowResolutionImage(
            file.buffer
          )
          this.imageService.saveFile(image, file)

          // const url = await this.dropboxService.uploadFile(file)
          const url = 'https://blah/haha'
          return { url, imageName: sanitizeFilename(file.originalname) }
        })
      )

      const gallery = await this.galleryRepository.createGallery({
        name: galleryData.name,
        description: galleryData.description,
        images: imageUrls,
      })

      return gallery
    } catch (error) {
      throw error
    }
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
        return { url, imageName: file.originalname }
      })
    )

    // Add images to gallery
    return await this.galleryRepository.addImagesToGallery(id, imageUrls)
  }
}
