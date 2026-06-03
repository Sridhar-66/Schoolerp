import { createClient } from '@supabase/supabase-js';
import { Database } from "@/lib/types"; // Ensure path is correct

export function createServerAdminClient() {
    // Standard Supabase client - no cookie generic overhead
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.PRIVATE_SUPABASE_SERVICE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        }
    );
}