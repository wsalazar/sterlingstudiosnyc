import { ConfigService } from '@nestjs/config'

export abstract class CloudProviderService {
  protected region: string
  protected accessKey: string
  protected secretAccessKey: string
  protected s3Bucket: string

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('s3.awsRegion')
    this.accessKey = this.configService.get<string>('s3.awsId')!
    this.secretAccessKey = this.configService.get<string>('s3.awsAccess')!
    this.s3Bucket = this.configService.get<string>('s3.bucket')!
  }

  abstract uploadFile(
    file: Express.Multer.File,
    fileName: string,
    subdirectory: string
  ): Promise<string>

  abstract deleteSubdirectory(bucketDirectory: string)

  abstract getDirectorySize(bucketDirectory: string)
  abstract removeImageObjectFromS3(
    bucketDirectory: string,
    files?: { imageName: string }[]
  )

  abstract copyImageObject(imageData: {
    image: { imageName: string }
    bucketSubdirectory: string
    newName?: string
    tempFile?: boolean
  })

  abstract deleteImageObject(imageData: {
    image: { imageName: string }
    bucketSubdirectory: string
  })
}
