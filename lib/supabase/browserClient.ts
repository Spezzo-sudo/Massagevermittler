import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** Returns a memoized Supabase browser client using public env keys. */
export function createSupabaseBrowserClient() {
  if (!client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase ENV Variablen fehlen.');
    }
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
