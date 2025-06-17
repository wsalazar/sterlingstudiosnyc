import { Injectable } from '@nestjs/common'
import * as sharp from 'sharp'
import * as path from 'path'
import { promises as fs } from 'fs'

@Injectable()
export class ImageService {
  private readonly uploadsDirectory: string
  constructor() {
    console.log('this is the dirnmae', __dirname)
    this.uploadsDirectory = path.join(
      __dirname + '/../../',
      'public',
      'uploads'
    )
    console.log('uplaods', this.uploadsDirectory)
    this.ensureUploadsDirectoryExists()
  }

  async ensureUploadsDirectoryExists() {
    try {
      await fs.access(this.uploadsDirectory)
    } catch {
      fs.mkdir(this.uploadsDirectory, { recursive: true })
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
      await fs.writeFile(`${this.uploadsDirectory}/${file.originalname}`, image)
    } catch (error) {
      throw new Error('There was an issue with storing the file' + error)
    }
  }
}
