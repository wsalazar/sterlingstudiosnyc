import { Injectable } from '@nestjs/common'
import { CloudProviderService } from './cloudprovider.service'
import { GalleryRepository } from '@/repositories/gallery.repository'
import { ImageService } from './image.service'

@Injectable()
export class GalleryService {
  private oldDirectoriesToDelete?: Set<string>

  private existingImages: {
    imageId: string
    bucketId: string
    imageName?: string
    price?: string
    bucket?: string
  }[]

  constructor(
    private readonly cloudProvider: CloudProviderService,
    private readonly galleryRepository: GalleryRepository,
    private readonly imageService: ImageService
  ) {}

  setExistingImages(existingImages: string[]) {
    let imageData: {
      imageId: string
      bucketId: string
      imageName?: string
      price?: string
      bucket?: string
    }[]
    if (Array.isArray(existingImages)) {
      imageData = existingImages?.map((image) => JSON.parse(image)) || []
    } else {
      imageData = [JSON.parse(existingImages)]
    }
    this.existingImages = imageData
  }

  private async moveImageToNewLocation(
    image: {
      imageId: string
      bucketId: string
      imageName?: string
      price?: string
      bucket?: string
    },
    existingBucket: {
      bucketDirectory: string
    },
    client: string,
    oldKey: string,
    newKey: string
  ): Promise<void> {
    const newUrl = await this.cloudProvider.moveObject(oldKey, newKey)
    if (!this.oldDirectoriesToDelete) {
      this.oldDirectoriesToDelete = new Set()
    }
    this.oldDirectoriesToDelete.add(existingBucket.bucketDirectory)

    await this.imageService.renameFileInServer(
      oldKey,
      newKey,
      `${client}/${image.bucket}`
    )

    // Update image URL
    await this.galleryRepository.updateImageByImageId(image.imageId, {
      url: newUrl,
    })

    // Update bucket directory
    await this.galleryRepository.updateGalleryBucketDirectory(
      image.bucketId,
      `${client}/${image.bucket}`
    )
  }

  async moveDirectory(): Promise<void> {
    await Promise.all(
      this.existingImages.map(async (image) => {
        const existingBucket =
          await this.galleryRepository.getGalleryBucketDirectoryByBucketId(
            image.bucketId
          )
        const slash = existingBucket.bucketDirectory.indexOf('/')
        const client = existingBucket.bucketDirectory.substring(0, slash)
        const imageObject = await this.galleryRepository.getImageNameById(
          image.imageId
        )
        const pathExists = await this.cloudProvider.pathExists(
          `${image.bucket}`
        )

        if (!pathExists) {
          const oldKey = `${existingBucket.bucketDirectory}${imageObject.imageName}`
          const newKey = `${client}/${image.bucket}${image.imageName}`

          await this.moveImageToNewLocation(
            image,
            existingBucket,
            client,
            oldKey,
            newKey
          )
          if (image?.imageName) {
            await this.galleryRepository.updateImageByImageId(image.imageId, {
              imageName: image.imageName,
            })
          }
          if (image?.price) {
            await this.galleryRepository.updateImageByImageId(image.imageId, {
              price: Number(image.price.replace('$', '')),
            })
          }
        }
      })
    )
  }

  async deleteSubdirectory() {
    if (this.oldDirectoriesToDelete) {
      await Promise.all(
        Array.from(this.oldDirectoriesToDelete).map(async (directory) => {
          await this.imageService.deleteSubdirectory(directory)
        })
      )
      this.oldDirectoriesToDelete.clear()
      this.oldDirectoriesToDelete = undefined
    }
  }

  async updateImageDetails(): Promise<void> {
    await Promise.all(
      this.existingImages.map(async (image) => {
        const existingBucket =
          await this.galleryRepository.getGalleryBucketDirectoryByBucketId(
            image.bucketId
          )
        const slash = existingBucket.bucketDirectory.indexOf('/')
        const client = existingBucket.bucketDirectory.substring(0, slash)
        const imageObject = await this.galleryRepository.getImageNameById(
          image.imageId
        )
        const pathExists = await this.cloudProvider.pathExists(
          `${image.bucket}`
        )

        if (!pathExists) {
          await this.galleryRepository.updateImageByImageId(image.imageId, {
            imageName: image.imageName,
          })
        }
      })
    )
  }
}
