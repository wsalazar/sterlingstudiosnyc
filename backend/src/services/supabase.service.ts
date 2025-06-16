import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
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
