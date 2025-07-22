import { Injectable } from '@nestjs/common'
import * as sharp from 'sharp'
import * as path from 'path'
import { createReadStream, promises as fs, readdirSync } from 'fs'
import { sanitizeFilename } from '@/utils/helper'
import { Image } from '@prisma/client'

@Injectable()
export class ImageService {
  private uploadsDirectory: string
  private subdirectory: string
  constructor() {
    this.setUploadsDirectory()
    this.ensureUploadsDirectoryExists()
  }

  async setUploadsDirectory(subdirectory: string = '') {
    this.uploadsDirectory = path.join(
      process.cwd(),
      'public',
      'uploads',
      ...subdirectory.split('/')
    )
  }

  /**
   *
   * @todo what is the return type to this
   */
  async getImageStream(image: Image) {
    return await createReadStream(this.uploadsDirectory + '/' + image.imageName)
  }

  async ensureUploadsDirectoryExists() {
    try {
      await fs.access(this.uploadsDirectory)
    } catch {
      await fs.mkdir(this.uploadsDirectory, {
        recursive: true,
      })
    }
  }

  async setSubdirectory(subdirectory) {
    this.subdirectory = subdirectory
    await this.setUploadsDirectory(subdirectory)
    try {
      await this.ensureUploadsDirectoryExists()
    } catch (error) {
      throw Error('Something went wrong' + error)
    }
  }

  async createLowResolutionImage(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 40,
          progressive: true,
        })
        .toBuffer()
    } catch (error) {
      throw new Error(
        'There was an error creating a low resolution image:' + error
      )
    }
  }

  async saveFile(image: Buffer, fileName: string) {
    try {
      await fs.writeFile(`${this.uploadsDirectory}/${fileName}`, image)
    } catch (error) {
      throw new Error(
        'There was an issue with storing the file in the server:' + error
      )
    }
  }

  async renameFileInServer(serverData: {
    bucketSubdirectory: string
    image: { imageName: string }
    newName?: string
  }) {
    try {
      if (!serverData?.newName) {
        return
      }
      const oldPath = `${this.uploadsDirectory}/${serverData.image.imageName}`
      const newPath = `${this.uploadsDirectory}/${serverData?.newName}`
      await fs.rename(oldPath, newPath)
    } catch (error) {
      throw new Error('There was an error rename file: ' + error)
    }
  }

  async deleteDirectory() {
    try {
      const lastIndex = this.uploadsDirectory.lastIndexOf('/')
      const topLevelDirectory = this.uploadsDirectory.substring(0, lastIndex)
      await fs.rmdir(topLevelDirectory, { recursive: true })
    } catch (error) {
      throw new Error('Failed to remove directory' + error)
    }
  }

  async deleteLowResolutionImagesFromDirectory(
    files?: { imageName: string }[]
  ) {
    try {
      await Promise.all(
        files?.map((file) => {
          fs.rm(`${this.uploadsDirectory}/${file.imageName}`)
        })
      )
    } catch (error) {
      throw new Error(
        'There was an error while trying to remove the low resolution image from the server:' +
          error
      )
    }
  }
}
