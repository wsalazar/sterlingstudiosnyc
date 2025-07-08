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
      rename: string[]
      price: number[]
      clientEmail: string
    }
  ) {
    console.log(galleryData)
    // try {
    //   let subdirectory = galleryData?.subdirectory ?? ''
    //   if (subdirectory) {
    //     if (!subdirectory.endsWith('/')) {
    //       subdirectory = `${galleryData.subdirectory.trim()}/`
    //       try {
    //         await this.imageService.setSubdirectory(subdirectory)
    //       } catch (error) {
    //         console.log('is ther ean error here?', error)
    //       }
    //     }
    //   }
    //   const renameFiles = galleryData.rename
    //   const prices = galleryData.price
    //   const imageUrls = await Promise.all(
    //     files.map(async (file, index) => {
    //       let fileName = renameFiles[index] || file.originalname
    //       fileName = sanitizeFilename(fileName)
    //       const image = await this.imageService.createLowResolutionImage(
    //         file.buffer
    //       )
    //       this.imageService.saveFile(image, fileName)
    //       const url = await this.cloudProvider.uploadFile(
    //         file,
    //         fileName,
    //         subdirectory
    //       )
    //       return { url, imageName: fileName, price: prices[index] }
    //     })
    //   )
    //   const totalSize = await this.cloudProvider.getDirectorySize(subdirectory)
    //   console.log('Total size', totalSize)
    //   return await this.galleryRepository.createGallery({
    //     name: galleryData.name,
    //     description: galleryData.description,
    //     images: imageUrls,
    //     createdBy: user.id,
    //     bucketDirectory: subdirectory,
    //     totalSize: totalSize,
    //     clientEmail: galleryData.clientEmail,
    //   })
    // } catch (error) {
    //   throw error
    // }
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

  // @Public()
  // @Get('/:id')
  // async getGallery(@Param('id') id: string, @Res() res: Response) {
  //   try {
  //     const gallery = await this.galleryRepository.getGallery(id)
  //     return res.status(200).json({ message: 'Success', data: gallery })
  //   } catch (error) {
  //     return res.status(error.status).json({ message: error.message })
  //   }
  // }

  // @Public()
  // @Delete('/:id')
  // async deleteGallery(@Param('id') id: string, @Res() res: Response) {
  //   try {
  //     const gallery = await this.galleryRepository.getGallery(id)
  //     const bucketDirectory = gallery.bucketDirectory
  //     this.imageService.setSubdirectory(bucketDirectory)
  //     await this.imageService.deleteDirectory()
  //     await this.cloudProvider.deleteSubdirectory(bucketDirectory)
  //     await this.galleryRepository.deleteGallery(id)
  //     return res.status(200).json({ message: 'Success' })
  //   } catch (error) {
  //     return res.status(error.status).json({ message: error.message })
  //   }
  // }

  // /**
  //  * @todo make sure to update the date
  //  * @param gallery
  //  * @param galleryId
  //  * @param res
  //  * @returns
  //  */
  // @Public()
  // @Patch('/update-fields/:id')
  // async updateFields(
  //   @Body()
  //   gallery: {
  //     newValue: string
  //     fieldName: string
  //   },
  //   @Param('id') galleryId: string,
  //   @Res() res: Response
  // ) {
  //   try {
  //     await this.galleryRepository.updateGalleryFields(galleryId, gallery)
  //     return res.status(200).json({ message: 'Success' })
  //   } catch (error) {
  //     return res.status(error.status).json({ message: error.message })
  //   }
  // }

  // /**
  //  * @todo make sure to update the date
  //  * @param files
  //  * @param gallery
  //  * @param galleryId
  //  */
  // @Public()
  // @Patch('/:id')
  // @UseInterceptors(FilesInterceptor('selectedImage', 100))
  // async updateImages(
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body()
  //   gallery: {
  //     galleryImage: string[]
  //   },
  //   @Param('id') galleryId: string,
  //   @Res() res: Response
  // ) {
  //   try {
  //     const galleryItems = await this.galleryRepository.getGallery(galleryId)
  //     const images = galleryItems.images.map((image) => image.imageName)
  //     const imageToRemove = images.filter(
  //       (img) => !gallery.galleryImage.includes(img)
  //     )
  //     this.imageService.setSubdirectory(galleryItems.bucketDirectory)

  //     if (imageToRemove.length > 0) {
  //       await this.imageService.deleteLowResolutionImagesFromDirectory(
  //         imageToRemove
  //       )
  //       await this.galleryRepository.deleteGalleryEntry(
  //         galleryId,
  //         imageToRemove
  //       )
  //       /**
  //        * I should not have to send the bucket directory. The object should know of it's existence
  //        * Or maybe inject the Image Service inot the Cloud Provider?
  //        */
  //       await this.cloudProvider.removeImageObjectFromS3(
  //         galleryItems.bucketDirectory,
  //         imageToRemove
  //       )
  //     }
  //     /**
  //      * todo this code is the same as when we create a gallery
  //      * we need to place this in the gallery repository
  //      */
  //     const imageUrls = await Promise.all(
  //       files.map(async (file) => {
  //         file.originalname = sanitizeFilename(file.originalname)
  //         const image = await this.imageService.createLowResolutionImage(
  //           file.buffer
  //         )
  //         this.imageService.saveFile(image, file)

  //         const url = await this.cloudProvider.uploadFile(
  //           file,
  //           galleryItems.bucketDirectory
  //         )
  //         return { url, imageName: file.originalname }
  //       })
  //     )
  //     const totalSize = await this.cloudProvider.getDirectorySize(
  //       galleryItems.bucketDirectory
  //     )

  //     await this.galleryRepository.updateGallery(galleryItems.id, {
  //       images: imageUrls,
  //       totalSize: totalSize,
  //     })
  //     return res.status(200).json({ message: 'Success' })
  //   } catch (error) {
  //     return res.status(error.status).json({ message: error.message })
  //   }
  // }
}
