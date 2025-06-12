import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private configService;
    private supabase;
    constructor(configService: ConfigService);
    getClient(): SupabaseClient;
    signUp(email: string, password: string): Promise<import("@supabase/supabase-js").AuthResponse>;
    signIn(email: string, password: string): Promise<import("@supabase/supabase-js").AuthTokenResponsePassword>;
    signOut(): Promise<{
        error: import("@supabase/supabase-js").AuthError | null;
    }>;
}
