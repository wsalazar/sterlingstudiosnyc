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

  private calculateUploadsDirectory(subdirectory: string = ''): string {
    return path.join(
      process.cwd(),
      'public',
      'uploads',
      ...subdirectory.split('/')
    )
  }

  async setUploadsDirectory(subdirectory: string = '') {
    this.uploadsDirectory = this.calculateUploadsDirectory(subdirectory)
  }

  /**
   *
   * @todo what is the return type to this
   */
  async getImageStream(image: Image) {
    return createReadStream(this.uploadsDirectory + '/' + image.imageName)
  }

  async ensureUploadsDirectoryExists() {
    try {
      await fs.mkdir(this.uploadsDirectory, {
        recursive: true,
      })
      // await fs.access(this.uploadsDirectory)
    } catch {
      console.log('upload directory', this.uploadsDirectory)
      // await fs.mkdir(this.uploadsDirectory, {
      //   recursive: true,
      // })
    }
  }

  async setSubdirectory(subdirectory: string) {
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

  async saveFile(image: Buffer, fileName: string, subdirectory: string) {
    try {
      const uploadsDirectory = this.calculateUploadsDirectory(subdirectory)
      await fs.mkdir(uploadsDirectory, { recursive: true })
      await fs.writeFile(`${uploadsDirectory}/${fileName}`, image)
    } catch (error) {
      throw new Error(
        'There was an issue with storing the file in the server:' + error
      )
    }
  }

  // Utility method for directory operations - can be used in both sequential and concurrent contexts
  async prepareDirectory(subdirectory: string): Promise<string> {
    const uploadsDirectory = this.calculateUploadsDirectory(subdirectory)
    await fs.mkdir(uploadsDirectory, { recursive: true })
    return uploadsDirectory
  }

  // Method that uses this.uploadsDirectory atomically (for when you really need it)
  async saveFileWithSharedState(
    image: Buffer,
    fileName: string,
    subdirectory: string
  ) {
    try {
      // Set the directory and save file atomically
      await this.setSubdirectory(subdirectory)
      console.log('path', `${this.uploadsDirectory}/${fileName}`)
      await fs.writeFile(`${this.uploadsDirectory}/${fileName}`, image)
    } catch (error) {
      throw new Error(
        'There was an issue with storing the file in the server:' + error
      )
    }
  }

  // New method: Stateless version that reuses your logic for concurrent operations
  async saveFileConcurrent(
    image: Buffer,
    fileName: string,
    subdirectory: string
  ) {
    try {
      // Use the utility method for directory preparation
      const uploadsDirectory = await this.prepareDirectory(subdirectory)

      console.log('path', `${uploadsDirectory}/${fileName}`)
      await fs.writeFile(`${uploadsDirectory}/${fileName}`, image)
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
      await fs.rm(topLevelDirectory, { recursive: true })
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
