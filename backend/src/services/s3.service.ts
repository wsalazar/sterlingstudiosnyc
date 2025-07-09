import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  ListObjectsCommand,
  DeleteObjectsCommand,
  RenameObjectCommand,
  CopyObjectCommand,
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
    fileName: string,
    subdirectory: string
  ): Promise<string> {
    try {
      const key = `${subdirectory}${fileName}`
      const command = new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      const resposnse = await this.s3.send(command)

      return `https://${this.s3Bucket}.s3.${this.region}.amazonaws.com/${key}`
    } catch (error) {
      if (error.error) {
        throw new Error('S3 API Error:' + JSON.stringify(error.error, null, 2))
      }
      throw new Error(`Failed to upload file to S3: ${error.message}`)
    }
  }

  async renameImageObject(imageData: {
    image: { imageName: string }
    bucketSubdirectory: string
    newName: string
  }) {
    /**
     * I was getting an error when trying to use RenameObjectCommand.
     * Issue is that in my version of the AWS SDK I have a x-amz-rename-source header that is not supported
     * // const renameParameters = {
      //   Bucket: this.s3Bucket,
      //   Key: keyDelete,
      //   RenameSource: keyDelete,
      //   NewKey: newKey,
      // }
      // const command = await new RenameObjectCommand(renameParameters)
     */
    try {
      const keyCopy = `${this.s3Bucket}/${imageData.bucketSubdirectory}${imageData.image.imageName}`
      console.log(keyCopy)
      const keyDelete = `${imageData.bucketSubdirectory}${imageData.image.imageName}`
      const newKey = `${imageData.bucketSubdirectory}${imageData.newName}`

      const copyParameter = {
        Bucket: this.s3Bucket,
        Key: newKey,
        CopySource: keyCopy,
      }
      const copyCommand = await new CopyObjectCommand(copyParameter)
      await this.s3.send(copyCommand)

      const deleteParameters = {
        Bucket: this.s3Bucket,
        Key: keyDelete,
      }
      const deleteCommand = await new DeleteObjectCommand(deleteParameters)

      await this.s3.send(deleteCommand)
    } catch (error) {
      console.log('This is the error', error)
      throw new Error(error)
    }
  }

  async getDirectorySize(bucketDirectory: string): Promise<number> {
    let continuationToken: string | undefined = undefined
    let totalSize = 0
    try {
      do {
        const command = new ListObjectsV2Command({
          Bucket: this.s3Bucket,
          Prefix: bucketDirectory,
          ContinuationToken: continuationToken,
        })
        const response = await this.s3.send(command)
        if (response.Contents) {
          totalSize += response.Contents.reduce((sum, obj) => {
            return sum + (obj.Size || 0)
          }, 0)
        }
        continuationToken = response.NextContinuationToken
      } while (continuationToken)
      return totalSize
    } catch (error) {
      throw new Error('There is an unknown error that occurred:' + error)
    }
  }

  async removeImageObjectFromS3(bucketDirectory: string, images: string[]) {
    try {
      const objectsToDelete = images.map((fileName) => ({
        Key: `${bucketDirectory}${fileName}`,
      }))
      const deleteParams = {
        Bucket: this.s3Bucket,
        Delete: {
          Objects: objectsToDelete,
          Quiet: false,
        },
      }
      const command = new DeleteObjectsCommand(deleteParams)
      await this.s3.send(command)
    } catch (error) {
      throw error
    }
  }

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
        throw new Error('S3 API Error:' + JSON.stringify(error.error, null, 2))
      }
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }
}
