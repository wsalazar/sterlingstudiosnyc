import { Public } from '@/decorators/public.decorator'
import { Roles } from '@/decorators/roles.decorator'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { GalleryRepository } from '@/repositories/gallery.repository'
import { ConfigService } from '@nestjs/config'
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
import { User } from '@prisma/client'
import { CloudProviderService } from '@/services/cloudprovider.service'
import { Response } from 'express'
import { UserRepository } from '@/repositories/user.repository'
import { v4 as uuidv4 } from 'uuid'
import { EmailService } from '@/services/email.service'
import { AccessTokenRepository } from '@/repositories/accessToken.repository'
import { JwtService } from '@nestjs/jwt'

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
    private imageService: ImageService,
    private userRepository: UserRepository,
    private emailService: EmailService,
    private configService: ConfigService,
    private accessTokenRepository: AccessTokenRepository,
    private jwtService: JwtService
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
      console.log('tests')
      let size = 0
      files.forEach((file) => (file.size += size))
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
      const users = await this.userRepository.getAllNonAdminUsers()
      const galleriesWithClients = galleries.map((gallery) => ({
        ...gallery,
        clients: users,
      }))

      console.log(galleries, users, galleriesWithClients)
      return res
        .status(200)
        .json({ message: 'Success', data: galleriesWithClients })
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

  @Post('/user')
  async assignUserToGallery(
    @Body() userGalleryData: { clientId: string; galleryId: string },
    @Res() res: Response
  ): Promise<Response> {
    try {
      console.log('user gallery data', userGalleryData)
      const user = await this.userRepository.getUserById(
        userGalleryData.clientId
      )
      const token = uuidv4()
      const galleryUrlLink = `${this.configService.get<string>('domain.url')}/gallery/user/${token}`
      await this.accessTokenRepository.save({
        token: token,
        galleryId: userGalleryData.galleryId,
        userId: userGalleryData.clientId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isActive: true,
      })
      await this.emailService.sendEmail({
        from: this.configService.get<string>('email.user'),
        to: user.email,
        subject: 'Your gallery link, from Sterling Studios NYC',
        html: `<img
                src="/assets/images/Logo_Final2022.jpg"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
              /><h1>${user.name}</h1><br />Your gallery link <a href="${galleryUrlLink}" target="_blank">${user.name}'s gallery</a>.`,
        text: `Welcome ${user.name}\nThe admin has been sent an email.`,
      })
      return res
        .status(200)
        .json({ message: 'Successfully added user to gallery!' })
    } catch (error) {
      const status = error.status || 500
      return res.status(status).json({ message: error.message })
    }
  }

  @Public()
  @Get('/user/validate/:token')
  async validateUserToken(@Param('token') token: string, @Res() res: Response) {
    try {
      const access = await this.accessTokenRepository.getToken(token)
      const user = await this.userRepository.getUserById(access.userId)
      const expiredMinutes = new Date(Date.now() - 10 * 60 * 1000)
      if (access.expiresAt <= expiredMinutes) {
        throw new Error('Token has expired!')
      }
      const { email, name, admin } = user

      const responseData = {
        user: {
          email,
          name,
          admin,
        },
        gallery: {
          galleryUuid: access.galleryId,
          userUuid: access.userId,
        },
        success: true,
      }

      const accessSecret = this.configService.get<string>('auth.jwtSecret')
      const payload = { email: user.email, sub: user.id }
      const accessToken = await this.jwtService.sign(payload, {
        secret: accessSecret,
        expiresIn: '60m',
      })

      res.cookie('sterling_session', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        maxAge: 3600000,
      })
      return res.status(200).json({ message: 'Success', data: responseData })
    } catch (error) {
      /**
       * @todo should not be a 500 if token is expired
       */
      const status = error.status || 500
      return res.status(status).json({ message: error.message })
    }
  }

  @Public()
  @Get('/user/send-new-link/:token/:overwrite')
  async sendNewLink(
    @Param('token') token: string,
    @Param('overwrite') overwrite: boolean,
    @Res({ passthrough: true }) response: Response
  ): Promise<Response> {
    try {
      /**
       * @Todo how to rate limit tokens
       */
      const access = await this.accessTokenRepository.getToken(token, overwrite)
      const user = await this.userRepository.getUserById(access.userId)
      await this.accessTokenRepository.deactivateToken(token)
      const newToken = uuidv4()
      await this.accessTokenRepository.save({
        token: newToken,
        galleryId: access.galleryId,
        userId: access.userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isActive: true,
      })
      const galleryUrlLink = `${this.configService.get<string>('domain.url')}/gallery/user/${newToken}`
      const logoUrl = `${this.configService.get<string>('domain.url')}/images/Logo_Final2022.jpg`

      await this.emailService.sendEmail({
        from: this.configService.get<string>('email.user'), //change this to a configuration
        to: user.email,
        subject: 'Your gallery link, from Sterling Studios NYC',
        html: `<img
                src="${logoUrl}"
                alt="Sterling Studios NYC Logo"
                width="100px"
                height="100px"
              /><h1>${user.name}</h1><br />Your gallery link <a href="${galleryUrlLink}" target="_blank">${user.name}'s gallery</a>.`,
        text: `Welcome ${user.name}\nThe admin has been sent an email.`,
      })

      return response
        .status(200)
        .json({ message: 'Email was sent to user!', data: { success: true } })
    } catch (error) {
      const status = error.status || 500
      return response.status(status).json({ message: error.message })
    }
  }

  @Get('images/:id')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    // // const stream = fs.createReadStream(⁠ /path/to/image/${id}.jpg ⁠);
    // res.set({
    //   'Content-Type': 'image/jpeg',
    // });
    // stream.pipe(res);
  }

  @Get('/user/fetch-images/:userUuid')
  async fetchUserImages(
    @Param('userUuid') userUuid: string,
    @Res({ passthrough: true }) response: Response
  ): Promise<Response> {
    const accessToken =
      await this.accessTokenRepository.getGalleryIdbyUserId(userUuid)
    const gallery = await this.galleryRepository.getGalleryById(
      accessToken.galleryId
    )
    const images = gallery.images.map((image) => ({
      uuid: image.id,
      price: image.price,
    }))

    return response.status(200).json({
      data: {
        galleryId: accessToken.galleryId,
        images: images,
        imageCount: images.length,
        bucketDirectory: gallery.bucketDirectory,
      },
      success: true,
    })
  }

  @Public()
  @Get('/user/image/:galleryUuid/:imageUuid')
  async fetchSingleImage(
    @Param('galleryUuid') galleryUuid: string,
    @Param('imageUuid') imageUuid: string,
    @Res() response: Response
  ): Promise<Response> {
    const gallery = await this.galleryRepository.getGalleryById(galleryUuid)
    this.imageService.setSubdirectory(gallery.bucketDirectory)
    const image = gallery.images.find((image) => image.id === imageUuid)
    if (!image) {
      return response.status(404).json({ error: 'Image not found!' })
    }
    const stream = await this.imageService.getImageStream(image)
    /**
     * @todo this will have to by dynamic based on the image extension
     */
    response.set({ 'Content-Type': 'image/jpeg' })
    stream.pipe(response)
  }
}
