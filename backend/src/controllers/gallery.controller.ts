import { Public } from '@/decorators/public.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { GalleryRepository } from '@/repositories/gallery.repository'
import { ImageService } from '@/services/image.service'
import { PrismaService } from '@/services/prisma.service'
import { sanitizeFilename } from '@/utils/helper'
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { FilesInterceptor } from '@nestjs/platform-express'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Gallery, User } from '@prisma/client'
import { S3Service } from '@/services/s3.service'
import { CloudProviderService } from '@/services/cloudprovider.service'
import { generateKey } from 'crypto'

interface GalleryImage {
  lastModified: number
  name: string
  size: number
  type: string
}

export const GetUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    return request.user
  }
)

@Controller('v1/gallery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GalleryController {
  constructor(
    @Inject('CloudProviderService')
    private readonly cloudProvider: CloudProviderService,
    private galleryRepository: GalleryRepository,
    private imageService: ImageService
  ) {}

  @Post('/')
  @UseInterceptors(FilesInterceptor('file', 100))
  async createGallery(
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: User,
    @Body()
    galleryData: {
      name: string
      description: string
      file: GalleryImage[]
      subdirectory: string
    }
  ): Promise<Gallery> {
    try {
      let subdirectory = galleryData?.subdirectory ?? ''
      console.log('this is the sub dir', subdirectory)
      if (subdirectory) {
        if (!subdirectory.endsWith('/')) {
          console.log('it does not end with a !')

          subdirectory = `${galleryData.subdirectory.trim()}/`
          console.log('set subdir', subdirectory)
          try {
            await this.imageService.setSubdirectory(subdirectory)
          } catch (error) {
            console.log('is ther ean error here?', error)
          }
        }
      }
      const imageUrls = await Promise.all(
        files.map(async (file) => {
          file.originalname = sanitizeFilename(file.originalname)
          const image = await this.imageService.createLowResolutionImage(
            file.buffer
          )
          console.log('save file', image, file)
          this.imageService.saveFile(image, file)

          const url = await this.cloudProvider.uploadFile(file, subdirectory)
          return { url, imageName: file.originalname }
        })
      )

      const totalSize = await this.cloudProvider.getDirectorySize(subdirectory)

      console.log('The total size of the dir is: ', totalSize)

      return await this.galleryRepository.createGallery({
        name: galleryData.name,
        description: galleryData.description,
        images: imageUrls,
        createdBy: user.id,
        bucketDirectory: subdirectory,
        totalSize: totalSize,
      })
    } catch (error) {
      throw error
    }
  }

  @Public()
  @Get('/')
  async getAllGalleries(): Promise<Gallery[] | []> {
    return this.galleryRepository.getAllGalleries()
  }

  @Public()
  @Get('/:id')
  async getGallery(@Param('id') id: string) {
    return await this.galleryRepository.getGallery(id)
  }

  @Public()
  @Delete('/:id')
  async deleteGallery(@Param('id') id: string) {
    try {
      const gallery = await this.galleryRepository.getGallery(id)
      const bucketDirectory = gallery.bucketDirectory
      this.imageService.setSubdirectory(bucketDirectory)
      await this.imageService.deleteDirectory()
      await this.cloudProvider.deleteSubdirectory(bucketDirectory)
      await this.galleryRepository.deleteGallery(id)
    } catch (error) {
      throw error
    }
  }

  @Public()
  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('selectedImage', 10))
  async updateImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    gallery: {
      galleryImage: string[]
    },
    @Param('id') galleryId: string
  ) {
    const galleries = await this.galleryRepository.getGallery(galleryId)
    const images = galleries.images.map((image) => image.imageName)
    const imageToRemove = images.filter(
      (img) => !gallery.galleryImage.includes(img)
    )
    this.imageService.setSubdirectory(galleries.bucketDirectory)
    // await this.imageService.deleteImagesFromDirectory(imageToRemove)
    // await this.galleryRepository.deleteGalleryEntry(galleryId, imageToRemove)
    await this.cloudProvider.removeImageObjectFromS3(galleries.bucketDirectory)

    // const notInImages = galleryImageArr.filter((img) => !images.includes(img))
    // console.log(galleryImages, images, notInImages)
    // console.log(id, files, galleryImages, gallery, images)
  }

  // @Public()
  // @Post('/:id/images')
  // @UseInterceptors(FilesInterceptor('file', 10))
  // async addImagesToGallery(
  //   @Param('id') id: string,
  //   @UploadedFiles() files: Express.Multer.File[]
  // ) {
  //   // Upload files to Dropbox and get URLs
  //   const imageUrls = await Promise.all(
  //     files.map(async (file) => {
  //       const url = await this.cloudProvider.uploadFile(file)
  //       return { url, imageName: file.originalname }
  //     })
  //   )

  //   // Add images to gallery
  //   return await this.galleryRepository.addImagesToGallery(id, imageUrls)
  // }
}
