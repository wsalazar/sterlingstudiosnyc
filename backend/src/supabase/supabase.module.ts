import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SupabaseService } from './supabase.service'
import configuration from '../config/configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
