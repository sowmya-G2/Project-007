import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables:
      NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "present" : "missing"}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "present" : "missing"}
    `)
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
