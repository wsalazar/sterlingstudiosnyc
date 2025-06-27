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
      __dirname + '/../../',
      'public',
      'uploads',
      ...subdirectory.split('/')
    )
  }

  async ensureUploadsDirectoryExists() {
    try {
      await fs.access(this.uploadsDirectory)
    } catch {
      fs.mkdir(this.uploadsDirectory, { recursive: true })
    }
  }

  async setSubdirectory(subdirectory) {
    this.subdirectory = subdirectory
    await this.setUploadsDirectory(subdirectory)
    await this.ensureUploadsDirectoryExists()
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

  async saveFile(
    image: Buffer,
    file: Express.Multer.File,
    subdirectory: string
  ) {
    try {
      const sanitizedFilename = sanitizeFilename(file.originalname)
      await fs.writeFile(`${this.uploadsDirectory}/${sanitizedFilename}`, image)
    } catch (error) {
      throw new Error('There was an issue with storing the file' + error)
    }
  }
}
