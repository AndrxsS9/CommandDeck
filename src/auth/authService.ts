import type { AuthError } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

/**
 * Capa delgada sobre Supabase Auth (email + contraseña).
 *
 * Nunca registra contraseñas ni tokens. Los errores técnicos se
 * traducen a códigos estables que la UI convierte en mensajes amigables.
 */

export type AuthErrorCode =
  | 'invalidCredentials'
  | 'userExists'
  | 'emailNotConfirmed'
  | 'weakPassword'
  | 'rateLimit'
  | 'network'
  | 'notConfigured'
  | 'generic';

export class AuthServiceError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthServiceError';
  }
}

/** Traduce un error de Supabase a un código de error amigable. */
export function mapAuthError(error: unknown): AuthErrorCode {
  if (error instanceof AuthServiceError) return error.code;

  const err = error as Partial<AuthError> & { name?: string; message?: string };
  const code = (err?.code ?? '').toString();
  const message = (err?.message ?? '').toLowerCase();

  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    return 'invalidCredentials';
  }
  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    message.includes('already registered')
  ) {
    return 'userExists';
  }
  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return 'emailNotConfirmed';
  }
  if (code === 'weak_password' || message.includes('password should be')) {
    return 'weakPassword';
  }
  if (code.startsWith('over_') || err?.status === 429) {
    return 'rateLimit';
  }
  if (
    err?.name === 'AuthRetryableFetchError' ||
    err?.status === 0 ||
    message.includes('failed to fetch') ||
    message.includes('network')
  ) {
    return 'network';
  }
  return 'generic';
}

function requireClient() {
  if (!supabase) throw new AuthServiceError('notConfigured');
  return supabase;
}

/** Ejecuta una operación y normaliza cualquier fallo como AuthServiceError. */
async function run<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AuthServiceError) throw error;
    // Solo información técnica del error, nunca credenciales ni sesión.
    const e = error as { code?: string; status?: number; message?: string };
    console.error(`[CommandDeck] Auth (${operation}) falló:`, e?.code, e?.status, e?.message);
    throw new AuthServiceError(mapAuthError(error));
  }
}

export function signIn(email: string, password: string): Promise<void> {
  return run('signIn', async () => {
    const { error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
  });
}

export interface SignUpResult {
  /** true si Supabase exige confirmar el correo antes de iniciar sesión. */
  needsEmailConfirmation: boolean;
}

export function signUp(fullName: string, email: string, password: string): Promise<SignUpResult> {
  return run('signUp', async () => {
    const { data, error } = await requireClient().auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;

    // Con confirmación de correo activa, Supabase devuelve un usuario sin
    // identidades cuando el correo ya está registrado (anti-enumeración).
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new AuthServiceError('userExists');
    }

    // Si hay sesión inmediata, onAuthStateChange llevará al usuario a CommandDeck.
    return { needsEmailConfirmation: !data.session };
  });
}

export function signOut(): Promise<void> {
  return run('signOut', async () => {
    const { error } = await requireClient().auth.signOut();
    // supabase-js elimina la sesión local incluso si falla la revocación remota
    // (p. ej. sin conexión), así que el usuario vuelve al Login igualmente.
    if (error) {
      console.error('[CommandDeck] Auth (signOut) revocación remota falló:', error.code, error.status);
    }
  });
}
