import { createClient } from '@supabase/supabase-js';

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Creates a Supabase client intended for route handlers / Edge Functions. */
export function createSupabaseRouteClient() {
  if (!serviceKey || !supabaseUrl) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY oder URL fehlt.');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'X-Client-Info': 'massagevermittlung-route' } }
  });
}
