import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Instancia ÚNICA del cliente Supabase para toda la aplicación.
 *
 * Solo se usa la clave pública "anon". La service_role NUNCA debe
 * llegar al cliente.
 *
 * Si faltan variables de entorno, el cliente queda en `null` y la
 * interfaz muestra un mensaje de configuración (no se inventan valores).
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[CommandDeck] Supabase no está configurado. Define VITE_SUPABASE_URL y ' +
      'VITE_SUPABASE_ANON_KEY en un archivo .env.local (ver .env.example).',
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        // Supabase gestiona y persiste la sesión (localStorage del webview).
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
