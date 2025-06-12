import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_ANON_KEY')
    )
  }

  getClient(): SupabaseClient {
    return this.supabase
  }

  // Add your Supabase methods here
  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password,
    })
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  async signOut() {
    return this.supabase.auth.signOut()
  }
}
