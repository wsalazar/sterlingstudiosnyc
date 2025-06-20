import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Dropbox } from 'dropbox'
import { sanitizeFilename } from '../utils/helper'
import axios from 'axios'

@Injectable()
export class DropboxService {
  private dropbox: Dropbox

  constructor(private configService: ConfigService) {
    // const appKey = this.configService.get<string>('DROPBOX_APP_KEY')
    // const appSecret = this.configService.get<string>('DROPBOX_APP_SECRET')
    // const oauth2Url = this.configService.get<string>('DROPBOX_OAUTH_URL')
    // if (!appKey || !appSecret || !oauth2Url) {
    //   throw new Error('Dropbox app key or secret is not configured')
    // }
    // this.initializeDropbox(appKey, appSecret, oauth2Url)
  }

  private async initializeDropbox(
    appKey: string,
    appSecret: string,
    oauth2Url: string
  ) {
    try {
      const oauth2QueryString = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: appKey,
        client_secret: appSecret,
      }).toString()

      console.log('Request URL:', oauth2Url)
      console.log('Request Body:', oauth2QueryString)

      const response = await axios.post(oauth2Url, oauth2QueryString, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      })
      console.log('test')
      console.log('Response Status:', response.status)
      console.log('Response Data:', response.data)

      if (!response.data.access_token) {
        throw new Error('No access token in response')
      }

      this.dropbox = new Dropbox({ accessToken: response.data.access_token })
    } catch (error) {
      console.error('Full error:', error)
      if (error.response) {
        console.error('Error response data:', error.response.data)
        console.error('Error response status:', error.response.status)
        console.error('Error response headers:', error.response.headers)
      }
      throw new Error(`Failed to initialize Dropbox: ${error.message}`)
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const path = `/${sanitizeFilename(file.originalname)}`
      const uploadParams = {
        path,
        contents: file.buffer,
        mode: { '.tag': 'overwrite' } as const,
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
