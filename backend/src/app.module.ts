import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SupabaseModule } from './modules/supabase.module'
import { AdminModule } from './modules/admin.module'
import { PrismaModule } from './modules/prisma.module'
import { AuthModule } from './modules/auth.module'
import { GalleryModule } from './modules/gallery.module'
import configuration from './config/configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PrismaModule,
    SupabaseModule,
    AdminModule,
    AuthModule,
    GalleryModule,
  ],
})
export class AppModule {}
