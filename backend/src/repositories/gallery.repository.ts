import { Injectable } from '@nestjs/common'
import { PrismaClient, Gallery } from '@prisma/client'

@Injectable()
export class GalleryRepository {
  constructor(private prisma: PrismaClient) {}

  // async createGallery(galleryData: { name: string; description: string }) {
  //   this.prisma.gallery.create(galleryData)
  // }
}
