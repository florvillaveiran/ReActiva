import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  // Helpful warning during development when env vars are missing
  // Keep this runtime check minimal and front-end safe.
  // Do NOT log secrets.
  // eslint-disable-next-line no-console
  console.warn('Supabase no está configurado. Establecé VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para habilitar funciones remotas.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        // Disable storage persistence to keep each browser tab isolated
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Use sessionStorage for temporary storage (per‑tab) if needed
        storage: sessionStorage,
      },
    })
  : null;
