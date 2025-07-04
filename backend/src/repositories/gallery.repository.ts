import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient, Gallery } from '@prisma/client'

@Injectable()
export class GalleryRepository {
  constructor(private prisma: PrismaClient) {}

  async createGallery(galleryData: {
    name: string
    description: string
    images?: { url: string; imageName: string }[]
    createdBy: string
    bucketDirectory: string
    totalSize: number
  }): Promise<Gallery> {
    return await this.prisma.gallery.create({
      data: {
        name: galleryData.name,
        description: galleryData.description,
        images: galleryData.images
          ? {
              create: galleryData.images,
            }
          : undefined,
        createdBy: galleryData.createdBy,
        bucketDirectory: galleryData.bucketDirectory,
        totalSize: galleryData.totalSize,
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
  }

  async getGallery(id: string) {
    return await this.prisma.gallery.findUnique({
      where: { id },
      include: {
        images: true,
      },
    })
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
      throw error
    }
  }

  async deleteGalleryEntry(galleryId: string, images: string[]) {
    await this.prisma.image.deleteMany({
      where: { galleryId, imageName: { in: images } },
    })
  }

  async deleteGallery(id: string) {
    await this.prisma.gallery.delete({
      where: { id: id },
      include: { images: true },
    })
  }

  async getAllGalleries(): Promise<Gallery[] | []> {
    return await this.prisma.gallery.findMany({
      include: {
        images: true,
        user: true,
      },
    })
  }

  async addImagesToGallery(
    galleryId: string,
    images: { url: string; imageName: string }[]
  ) {
    return await this.prisma.gallery.update({
      where: { id: galleryId },
      data: {
        images: {
          create: images,
        },
      },
      include: {
        images: true,
      },
    })
  }
}
