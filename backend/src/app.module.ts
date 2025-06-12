import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SupabaseModule } from './supabase/supabase.module'
import { AdminModule } from './admin/admin.module'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
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
  ],
})
export class AppModule {}
