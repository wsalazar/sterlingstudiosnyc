import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as path from 'path'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)

  app.use(cookieParser())

  // Enable CORS with more permissive settings for development
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })

  // Serve static files from the public directory
  app.useStaticAssets(path.join(__dirname, '..', 'public'), {
    prefix: '/',
  })

  // Enable validation
  app.useGlobalPipes(new ValidationPipe())

  const port = configService.get('PORT') || 3001
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}
bootstrap()
