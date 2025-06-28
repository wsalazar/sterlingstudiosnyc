import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SupabaseModule } from './modules/supabase.module'
import { AdminModule } from './modules/admin.module'
import { PrismaModule } from './modules/prisma.module'
import { AuthModule } from './modules/auth.module'
import { GalleryModule } from './modules/gallery.module'
import configuration from './config/configuration'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
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
