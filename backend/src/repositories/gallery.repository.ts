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
    clientEmail: string
  }): Promise<Gallery> {
    return await this.prisma.gallery.create({
      data: {
        name: galleryData.name,
        description: galleryData.description,
        images: galleryData.images
          ? {
              create: galleryData.images.map((img, i) => ({
                ...img,
                price: img.price[i],
              })),
            }
          : undefined,
        createdBy: galleryData.createdBy,
        bucketDirectory: galleryData.bucketDirectory,
        totalSize: galleryData.totalSize,
        clientEmail: galleryData.clientEmail,
      },
      include: {
        images: true,
      },
    })
  }

  async updateGallery(
    galleryId: string,
    galleryData: {
      images?: { url: string; imageName: string }[]
      totalSize: number
    }
  ) {
    try {
      return await this.prisma.gallery.update({
        data: {
          images: galleryData.images
            ? {
                create: galleryData.images,
              }
            : undefined,
          totalSize: galleryData.totalSize,
        },
        include: {
          images: true,
        },
        where: { id: galleryId },
      })
    } catch (error) {
      throw new Error('There was an error saving your gallery:' + error)
    }
  }

  async getGallery(id: string) {
    try {
      return await this.prisma.gallery.findUnique({
        where: { id },
        include: {
          images: true,
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

  async deleteGalleryEntry(galleryId: string, images: string[]) {
    try {
      await this.prisma.image.deleteMany({
        where: { galleryId, imageName: { in: images } },
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

  async getAllGalleries(): Promise<Gallery[] | []> {
    try {
      return await this.prisma.gallery.findMany({
        include: {
          images: true,
          user: true,
        },
      })
    } catch (error) {
      throw new Error(
        'There was an error while trying to fetch all galleries: ' + error
      )
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
