import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  ListObjectsCommand,
  DeleteObjectsCommand,
  QuoteFields,
} from '@aws-sdk/client-s3'
import { sanitizeFilename } from '../utils/helper'
import axios from 'axios'
import { CloudProviderService } from './cloudprovider.service'
import { ObjectUnsubscribedError } from 'rxjs'

@Injectable()
export class S3Service extends CloudProviderService {
  private s3: S3Client

  constructor() {
    super(new ConfigService())
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretAccessKey,
      },
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    subdirectory: string
  ): Promise<string> {
    try {
      const key = `${subdirectory}${file.originalname}`
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })

      await this.s3.send(command)

      return `https://${this.s3Bucket}.s3.${this.region}.amazonaws.com/${key}`
    } catch (error) {
      if (error.error) {
        console.error('S3 API Error:', JSON.stringify(error.error, null, 2))
      }
      throw new Error(`Failed to upload file to S3: ${error.message}`)
    }
  }

  async getDirectorySize(bucketDirectory: string): Promise<number> {
    console.log(bucketDirectory)
    let continuationToken: string | undefined = undefined
    let totalSize = 0
    do {
      const command = new ListObjectsV2Command({
        Bucket: this.s3Bucket,
        Prefix: bucketDirectory,
        ContinuationToken: continuationToken,
      })
      const response = await this.s3.send(command)
      if (response.Contents) {
        totalSize += response.Contents.reduce((sum, obj) => {
          console.log('obj', obj)
          return sum + (obj.Size || 0)
        }, 0)
      }
      continuationToken = response.NextContinuationToken
    } while (continuationToken)
    console.log('total size', totalSize)
    return totalSize
  }

  async removeImageObjectFromS3(bucketDirectory: string) {}

  async deleteSubdirectory(bucketDirectory: string) {
    try {
      const listParematers = {
        Bucket: this.s3Bucket,
        Prefix: bucketDirectory,
      }
      const list = await this.s3.send(new ListObjectsV2Command(listParematers))
      if (!list.Contents || list.Contents.length === 0) {
        throw Error('Folder is empty or does not exist')
      }
      if (list.Contents && list.Contents.length > 0) {
        const listResults = list.Contents.map((obj) => ({ Key: obj.Key }))
        const deleteParameters = {
          Bucket: this.s3Bucket,
          Delete: { Objects: listResults, Quiet: false },
        }
        const command = new DeleteObjectsCommand(deleteParameters)
        await this.s3.send(command)
      }
    } catch (error) {
      if (error.error) {
        console.error('S3 API Error:', JSON.stringify(error.error, null, 2))
      }
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }
}
