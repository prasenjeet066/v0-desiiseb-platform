import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./types"

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>()
  }
  return supabaseClient
}

export const supabase = createClient()
