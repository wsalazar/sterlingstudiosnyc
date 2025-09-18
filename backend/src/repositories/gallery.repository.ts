import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient, Gallery } from '@prisma/client'

@Injectable()
export class GalleryRepository {
  constructor(private prisma: PrismaClient) {}

  async createGallery(galleryData: {
    name: string
    description: string
    images: { url: string; imageName: string; price: number }[]
    createdBy: string
    bucketDirectory: string
    totalSize: number
    clientEvents: string[]
  }): Promise<Gallery> {
    const gallery = await this.prisma.gallery.create({
      data: {
        name: galleryData.name,
        description: galleryData.description,
        createdBy: galleryData.createdBy,
        totalSize: galleryData.totalSize,
        galleryBuckets: {
          create: galleryData.clientEvents.map((event) => ({
            bucketDirectory: galleryData.bucketDirectory + event + '/',
          })),
        },
      },
      include: {
        galleryBuckets: true,
      },
    })

    if (galleryData.images && galleryData.images.length > 0) {
      const imagesWithBuckets = galleryData.images.map((img, index) => ({
        ...img,
        price: Number(img.price),
        galleryId: gallery.id,
        galleryBucketId:
          gallery.galleryBuckets[index % gallery.galleryBuckets.length].id,
      }))

      await this.prisma.image.createMany({
        data: imagesWithBuckets,
      })
    }
    return await this.prisma.gallery.findUnique({
      where: { id: gallery.id },
      include: {
        images: true,
        galleryBuckets: true,
      },
    })
  }

  async createImages(
    galleryId: string,
    imagesData: { url: string; imageName: string; price: string }[]
  ) {}

  async updateGallery(
    galleryId: string,
    galleryData: {
      url: string
      imageName: string
      price: string
      clientEvents: string[]
    }[],
    totalSize: number
  ) {
    try {
      const gallery = await this.prisma.gallery.update({
        data: {
          totalSize: totalSize,
        },
        include: {
          images: true,
        },
        where: { id: galleryId },
      })
      // // if (galleryData.images && galleryData.images.length > 0) {
      // const imagesWithBuckets = galleryData.images.map((img, index) => ({
      //   ...img,
      //   price: Number(img.price),
      //   galleryId: gallery.id,
      //   galleryBucketId:
      //     gallery.galleryBuckets[index % gallery.galleryBuckets.length].id,
      // }))
      // await this.prisma.image.createMany({
      //   data: galleryData.map((img) => ({
      //     ...img,
      //     price: Number(img.price),
      //     galleryId: galleryId,
      //     galleryBucketId: img.clientEvents[0],
      //   })),
      // })
      return gallery
    } catch (error) {
      throw new Error('There was an error saving your gallery:' + error)
    }
  }

  // async updateGalleryWithUser(userGalleryData: {
  //   clientId: string
  //   galleryId: string
  // }) {
  //   try {
  //     // console.log(userGalleryData.galleryId, userGalleryData.clientId)
  //     await this.prisma.gallery.update({
  //       where: { id: userGalleryData.galleryId },
  //       data: { userUuid: userGalleryData.clientId },
  //     })
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(
  //         "Could not find gallery or it doesn't exist: " + error
  //       )
  //     }
  //     throw new Error(
  //       'There as an error while trying to assign user this gallery:' + error
  //     )
  //   }
  // }

  async getGallery(id: string) {
    try {
      return await this.prisma.gallery.findUnique({
        where: { id },
        include: {
          images: true,
          galleryBuckets: true,
        },
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          "Could not find gallery or it doesn't exist: " + error
        )
      }
      throw new Error(
        'There as an error while trying to access this gallery:' + error
      )
    }
  }

  async getGalleryBucketDirectoryByBucketId(bucketId: string) {
    return await this.prisma.galleryBucket.findUnique({
      where: { id: bucketId },
      select: { bucketDirectory: true },
    })
  }

  async getGalleryById(id: string) {
    try {
      return await this.prisma.gallery.findUnique({
        where: { id },
        select: {
          images: true,
          // bucketDirectory: true,
        },
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(
          "Could not find gallery or it doesn't exist: " + error
        )
      }
      throw new Error(
        'There as an error while trying to access this gallery:' + error
      )
    }
  }

  async updateGalleryFields(
    galleryId: string,
    gallery: { fieldName: string; newValue: string }
  ) {
    try {
      await this.prisma.gallery.update({
        where: { id: galleryId },
        data: {
          [gallery.fieldName]: gallery.newValue,
          updatedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Record could not be found')
      }
      throw new Error(
        'There was an error while trying to update the gallery:' + error
      )
    }
  }

  async deleteGalleryEntry(galleryId: string, files?: { imageName: string }[]) {
    try {
      const imageNames = files?.map((file) => file.imageName) || []

      await this.prisma.image.deleteMany({
        where: {
          galleryId,
          imageName: { in: imageNames },
        },
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Record not found: ' + error)
      }
      throw new Error(
        'There was an error was trying to delete the gallery: ' + error
      )
    }
  }

  async deleteGallery(id: string) {
    try {
      await this.prisma.gallery.delete({
        where: { id: id },
        include: { images: true },
      })
    } catch (error) {
      throw new Error(
        'There was an error was trying to delete the gallery: ' + error
      )
    }
  }

  /**
   * @todo user token has a certain expiration to it but should it still be active?
   * @todo if it's not active how should it be selected form this query down here
   */
  async getAllGalleries(): Promise<Gallery[] | []> {
    try {
      const galleries = await this.prisma.gallery.findMany({
        include: {
          images: true,
          galleryBuckets: true,
          user: true,
          accessToken: {
            where: {
              isActive: true,
            },
            select: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      })
      return galleries.map((gallery) => ({
        ...gallery,
        accessTokens: gallery.accessToken[0] || null,
      }))
    } catch (error) {
      throw new Error(
        'There was an error while trying to fetch all galleries: ' + error
      )
    }
  }

  async getImageNameById(imgId: string): Promise<{ imageName: string }> {
    try {
      return await this.prisma.image.findUnique({
        where: { id: imgId },
        select: { imageName: true },
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Could not find image: ${error}`)
      }
      throw new Error(`Could not find image: ${error}`)
    }
  }

  async updateImageByImageId(
    imgId: string,
    imageData: { imageName?: string; url?: string; price?: number }
  ) {
    await this.prisma.image.update({
      where: { id: imgId },
      data: imageData,
    })
  }

  async updateGalleryBucketDirectory(
    bucketId: string,
    newBucketDirectory: string
  ) {
    await this.prisma.galleryBucket.update({
      where: { id: bucketId },
      data: { bucketDirectory: newBucketDirectory },
    })
  }

  async updateImages(
    galleryId: string,
    imgId: string,
    renamedFile?: string,
    s3Url?: string,
    price?: string
  ) {
    try {
      let updateData: { imageName?: string; url?: string; price?: number } = {}
      if (renamedFile) {
        updateData.imageName = renamedFile
      }
      if (s3Url) {
        updateData.url = s3Url
      }
      if (price) {
        updateData.price = Number(price?.replace('$', ''))
      }
      await this.prisma.gallery.update({
        where: { id: galleryId },
        data: {
          images: {
            update: {
              where: { id: imgId },
              data: updateData,
            },
          },
          updatedAt: new Date().toISOString(),
        },
        include: {
          images: true,
        },
      })
    } catch (error) {
      throw new Error(`Could not find image: ${error}`)
    }
  }

  // async addImagesToGallery(
  //   galleryId: string,
  //   images: { url: string; imageName: string }[]
  // ) {
  //   return await this.prisma.gallery.update({
  //     where: { id: galleryId },
  //     data: {
  //       images: {
  //         create: images,
  //       },
  //     },
  //     include: {
  //       images: true,
  //     },
  //   })
  // }
}
