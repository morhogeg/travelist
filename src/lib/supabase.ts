import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in your env before using Supabase.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Lightweight connectivity check that doesn't require any tables.
 * Returns { ok: boolean, error?: string }.
 */
export async function checkSupabaseConnection() {
  if (!supabase) {
    return { ok: false, error: 'Supabase client not initialized (missing env vars).' };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'Unknown error' };
  }
}
