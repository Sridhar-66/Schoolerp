import { createBrowserClient } from '@supabase/ssr'
import {
  ClientType,
  SassClient
} from "@/lib/supabase/unified"

// 1. Point this directly to your freshly generated types file 👇
import { Database } from "@/types/supabase" 

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createSPAClient() {
  return createClient()
}

export async function createSPASassClient() {
  const client = createClient()

  return new SassClient(
    client as any,
    ClientType.SPA
  )
}

export async function createSPASassClientAuthenticated() {
  const client = createClient()

  const {
    data: { session }
  } = await client.auth.getSession()

  if (!session) {
    window.location.href = '/auth/login'
    throw new Error('User not authenticated')
  }

  return new SassClient(
    client as any,
    ClientType.SPA
  )
}