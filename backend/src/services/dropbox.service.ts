import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Dropbox } from 'dropbox'

@Injectable()
export class DropboxService {
  private dropbox: Dropbox

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>('DROPBOX_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('Dropbox access token is not configured')
    }
    this.dropbox = new Dropbox({ accessToken })
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const path = `/${file.originalname}`
      const uploadParams = {
        path,
        contents: file.buffer,
        mode: { '.tag': 'add' } as const,
        autorename: true,
        mute: false,
      }

      const response = await this.dropbox.filesUpload(uploadParams)

      const linkResponse = await this.dropbox.filesGetTemporaryLink({
        path: response.result.path_display!,
      })

      return linkResponse.result.link
    } catch (error) {
      console.error('Error uploading to Dropbox:', error)
      if (error.error) {
        console.error(
          'Dropbox API Error:',
          JSON.stringify(error.error, null, 2)
        )
      }
      throw new Error(`Failed to upload file to Dropbox: ${error.message}`)
    }
  }
}
