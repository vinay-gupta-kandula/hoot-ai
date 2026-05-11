import { createClient } from '@supabase/supabase-js'

/**
 * Shared Supabase Admin Client
 * USE ONLY ON THE SERVER SIDE.
 * This client uses the SERVICE_ROLE_KEY to bypass Row Level Security (RLS).
 */
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Singleton instance for server-side usage
export const supabaseAdmin = createAdminClient()
