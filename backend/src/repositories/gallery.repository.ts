import { Injectable } from '@nestjs/common'
import { PrismaClient, Gallery } from '@prisma/client'

@Injectable()
export class GalleryRepository {
  constructor(private prisma: PrismaClient) {}

  async createGallery(galleryData: {
    name: string
    description: string
    images?: { url: string; imageName: string }[]
  }) {
    return await this.prisma.gallery.create({
      data: {
        name: galleryData.name,
        description: galleryData.description,
        images: galleryData.images
          ? {
              create: galleryData.images,
            }
          : undefined,
      },
      include: {
        images: true,
      },
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

  async getAllGalleries() {
    return await this.prisma.gallery.findMany({
      include: {
        images: true,
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
