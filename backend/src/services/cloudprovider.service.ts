import { ConfigService } from '@nestjs/config'

export abstract class CloudProviderService {
  protected region: string
  protected accessKey: string
  protected secretAccessKey: string
  protected s3Bucket: string

  constructor(private configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION')
    this.accessKey = this.configService.get<string>('AWS_ACCESS_KEY_ID')!
    this.secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY'
    )!
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET')!
  }

  abstract uploadFile(
    file: Express.Multer.File,
    subdirectory: string
  ): Promise<string>

  abstract deleteSubdirectory(bucketDirectory: string)

  abstract getDirectorySize(bucketDirectory: string)
  abstract removeImageObjectFromS3(bucketDirectory: string)
}
