import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Instancia ÚNICA del cliente Supabase para toda la aplicación.
 *
 * Solo se usa la Project URL y la Publishable Key pública. La Secret Key o
 * service_role NUNCA deben llegar al cliente.
 *
 * Si faltan variables de entorno, el cliente queda en `null` y la
 * interfaz muestra un mensaje de configuración (no se inventan valores).
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(url && publishableKey);

if (!isSupabaseConfigured) {
  console.error(
    '[CommandDeck] Supabase no está configurado. Define VITE_SUPABASE_URL y ' +
      'VITE_SUPABASE_PUBLISHABLE_KEY en un archivo .env.local (ver .env.example).',
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, publishableKey, {
      auth: {
        // Supabase gestiona y persiste la sesión (localStorage del webview).
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
