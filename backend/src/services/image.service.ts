import { Injectable } from '@nestjs/common'
import * as sharp from 'sharp'
import * as path from 'path'
import { promises as fs } from 'fs'
import { sanitizeFilename } from '@/utils/helper'

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
      throw error
    }
  }

  async createLowResolutionImage(buffer: Buffer): Promise<Buffer> {
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
  }

  async saveFile(image: Buffer, file: Express.Multer.File) {
    try {
      console.log(`${this.uploadsDirectory}/${file.originalname}`, image)
      await fs.writeFile(`${this.uploadsDirectory}/${file.originalname}`, image)
    } catch (error) {
      throw new Error('There was an issue with storing the file' + error)
    }
  }

  async deleteDirectory() {
    try {
      const lastIndex = this.uploadsDirectory.lastIndexOf('/')
      const topLevelDirectory = this.uploadsDirectory.substring(0, lastIndex)
      console.log(this.uploadsDirectory.lastIndexOf('/'))
      await fs.rmdir(topLevelDirectory, { recursive: true })
    } catch (error) {
      throw new Error('Failed to remove directory' + error)
    }
  }

  async deleteLowResolutionImagesFromDirectory(files: string[]) {
    try {
      await Promise.all(
        files.map((file: string) => {
          fs.rm(`${this.uploadsDirectory}/${file}`)
        })
      )
    } catch (erro) {}
  }
}
