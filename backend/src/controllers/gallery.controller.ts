import { Public } from '@/decorators/public.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { GalleryRepository } from '@/repositories/gallery.repository'
import { ImageService } from '@/services/image.service'
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
  Res,
  createParamDecorator,
  ExecutionContext,
  Req,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Gallery, User } from '@prisma/client'
import { CloudProviderService } from '@/services/cloudprovider.service'
import { Response } from 'express'

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
      newFile: string[]
      price: number[]
    },
    @Res() res: Response
  ): Promise<Response> {
    try {
      console.log(files)
      let size = 0
      files.forEach((file) => (file.size += size))
      console.log(size)
      let subdirectory = galleryData?.subdirectory ?? ''
      if (subdirectory) {
        if (!subdirectory.endsWith('/')) {
          subdirectory = `${galleryData.subdirectory.trim()}/`
          try {
            await this.imageService.setSubdirectory(subdirectory)
          } catch (error) {
            const status = error.status || 500
            return res.status(status).json({ message: error.message })
          }
        }
      }
      const renameFiles = galleryData.newFile
      const prices = galleryData.price
      const imagesData = await Promise.all(
        files.map(async (file, index) => {
          let fileName = renameFiles[index] || file.originalname
          fileName = sanitizeFilename(fileName)
          const image = await this.imageService.createLowResolutionImage(
            file.buffer
          )
          this.imageService.saveFile(image, fileName)
          const url = await this.cloudProvider.uploadFile(
            file,
            fileName,
            subdirectory
          )
          return { url, imageName: fileName, price: prices[index] }
        })
      )
      const totalSize = await this.cloudProvider.getDirectorySize(subdirectory)
      const gallery = await this.galleryRepository.createGallery({
        name: galleryData.name,
        description: galleryData.description,
        images: imagesData,
        createdBy: user.id,
        bucketDirectory: subdirectory,
        totalSize: totalSize,
      })
      return res
        .status(201)
        .json({ message: 'Successfully created a gallery.', data: gallery })
    } catch (error) {
      const status = error.status || 500
      return res.status(status).json({ message: error.message })
    }
  }

  @Public()
  @Get('/')
  async getAllGalleries(@Res() res: Response): Promise<Response> {
    try {
      const galleries = await this.galleryRepository.getAllGalleries()
      return res.status(200).json({ message: 'Success', data: galleries })
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  @Public()
  @Get('/:id')
  async getGallery(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const gallery = await this.galleryRepository.getGallery(id)
      console.log(gallery)
      return res.status(200).json({ message: 'Success', data: gallery })
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  @Public()
  @Delete('/:id')
  async deleteGallery(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const gallery = await this.galleryRepository.getGallery(id)
      const bucketDirectory = gallery.bucketDirectory
      this.imageService.setSubdirectory(bucketDirectory)
      await this.imageService.deleteDirectory()
      await this.cloudProvider.deleteSubdirectory(bucketDirectory)
      await this.galleryRepository.deleteGallery(id)
      return res.status(200).json({ message: 'Gallery deleted successfully' })
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  /**
   * @todo make sure to update the date
   * @param gallery
   * @param galleryId
   * @param res
   * @returns
   */
  @Public()
  @Patch('/update-fields/:id')
  async updateFields(
    @Body()
    gallery: {
      newValue: string
      fieldName: string
    },
    @Param('id') galleryId: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      await this.galleryRepository.updateGalleryFields(galleryId, gallery)
      return res.status(200).json({ message: 'Gallery updated successfully' })
    } catch (error) {
      return res.status(error.status).json({ message: error.message })
    }
  }

  // /**
  //  * @todo make sure to update the date
  //  * @param files
  //  * @param gallery
  //  * @param galleryId
  //  */
  @Public()
  @Patch('/:id')
  @UseInterceptors(FilesInterceptor('image', 100))
  async updateImages(
    @UploadedFiles() image: Express.Multer.File[],
    @Body()
    gallery: {
      newPrice?: string[]
      newFile?: string[]
      existingImages?: string[]
      removedImages?: string[]
    },
    @Param('id') galleryId: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      console.log(image)
      let size = 0
      image.forEach((file) => (file.size += size))
      console.log(size)
      const { newPrice, newFile, existingImages, removedImages } = gallery
      const imageData =
        existingImages?.map((images) => JSON.parse(images)) || []
      const galleryItems = await this.galleryRepository.getGallery(galleryId)
      // /**
      //  * Might want to throw this stuff into the image service
      //  * @todo if the admin renames it but then removes. removing will take priority.
      //  * So will have to capture image id and not go by image name
      //  */
      // Remove files that have been marked by users in the client
      const images = galleryItems.images.map((image) => image.id)
      const imagesToRemove = images.filter((imgId) =>
        removedImages?.includes(imgId)
      )
      this.imageService.setSubdirectory(galleryItems.bucketDirectory)
      const imageObj = await Promise.all(
        imagesToRemove?.map(async (imgId) => {
          const image = await this.galleryRepository.getImageNameById(imgId)
          return { imageName: image.imageName }
        })
      )
      await this.imageService.deleteLowResolutionImagesFromDirectory(imageObj)
      await this.galleryRepository.deleteGalleryEntry(galleryId, imageObj)
      await this.cloudProvider.removeImageObjectFromS3(
        galleryItems.bucketDirectory,
        imageObj
      )

      // /**
      //  * I should not have to send the bucket directory. The object should know of it's existence
      //  * Or maybe inject the Image Service inot the Cloud Provider?
      //  */

      // Rename files in S3 and in server
      await Promise.all(
        imageData?.map(async (img) => {
          const image = await this.galleryRepository.getImageNameById(img.id)
          let newS3Url = null
          let renamedImage = null

          if (img?.imageName) {
            await this.cloudProvider.copyImageObject({
              image,
              bucketSubdirectory: galleryItems.bucketDirectory,
              newName: img.imageName,
              tempFile: true,
            })
            await this.cloudProvider.deleteImageObject({
              image,
              bucketSubdirectory: galleryItems.bucketDirectory,
            })
            const s3Url = await this.cloudProvider.copyImageObject({
              image: { imageName: `${img.imageName}.tmp` },
              bucketSubdirectory: galleryItems.bucketDirectory,
              newName: img.imageName,
            })
            await this.cloudProvider.deleteImageObject({
              image: { imageName: `${img.imageName}.tmp` },
              bucketSubdirectory: galleryItems.bucketDirectory,
            })
            newS3Url = s3Url
            renamedImage = img?.imageName
          }
          const serverData = {
            bucketSubdirectory: galleryItems.bucketDirectory,
            image,
            newName: renamedImage,
          }
          await this.imageService.renameFileInServer(serverData)
          await this.galleryRepository.updateImages(
            galleryId,
            img.id,
            renamedImage,
            newS3Url,
            img?.price
          )
        })
      )

      const imagesData = await Promise.all(
        image?.map(async (img, index) => {
          let fileName = newFile[index] || img.originalname
          fileName = sanitizeFilename(fileName)
          const image = await this.imageService.createLowResolutionImage(
            img.buffer
          )
          this.imageService.saveFile(image, fileName)
          const url = await this.cloudProvider.uploadFile(
            img,
            fileName,
            galleryItems.bucketDirectory
          )
          return { url, imageName: fileName, price: newPrice[index] }
        })
      )
      const totalSize = await this.cloudProvider.getDirectorySize(
        galleryItems.bucketDirectory
      )
      await this.galleryRepository.updateGallery(
        galleryId,
        imagesData,
        totalSize
      )
      return res.status(200).json({ message: 'Gallery updated successfully' })
    } catch (error) {
      const status = error.status || 500
      return res.status(status).json({ message: error.message })
    }
  }
}
