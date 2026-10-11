/**
 * Validaciones locales de los formularios de autenticación.
 *
 * Devuelven códigos de error (no textos) para que la UI los traduzca.
 * La política final de contraseñas la aplica Supabase en el servidor.
 */

export const NAME_MIN_LENGTH = 5;
export const NAME_MAX_LENGTH = 80;

/** Máximo definido para CommandDeck. */
export const PASSWORD_MAX_LENGTH = 100;

/**
 * Mínimo por defecto de Supabase Auth ("Minimum password length" = 6).
 * Si el proyecto configura un mínimo mayor, Supabase rechazará la
 * contraseña y se mostrará el error "weakPassword".
 */
export const PASSWORD_MIN_LENGTH = 6;

export type EmailError = 'emailRequired' | 'emailInvalid';
export type NameError = 'nameRequired' | 'nameInvalidChars' | 'nameLength';
export type PasswordError = 'passwordRequired' | 'passwordTooShort' | 'passwordTooLong';
export type ConfirmError = 'passwordMismatch';

/** Formato razonable: algo@algo.dominio, sin espacios. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Una o más palabras de letras Unicode separadas por un único espacio. */
const NAME_PATTERN = /^\p{L}+(?: \p{L}+)*$/u;

/** Longitud en caracteres reales (code points), no en unidades UTF-16. */
function charLength(value: string): number {
  return Array.from(value).length;
}

export function normalizeEmail(email: string): string {
  return email.trim();
}

export function validateEmail(email: string): EmailError | null {
  const value = normalizeEmail(email);
  if (!value) return 'emailRequired';
  if (!EMAIL_PATTERN.test(value)) return 'emailInvalid';
  return null;
}

/**
 * Normaliza el nombre: forma Unicode NFC (tildes compuestas),
 * sin espacios iniciales/finales y con espacios internos colapsados.
 */
export function normalizeName(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ');
}

export function validateName(name: string): NameError | null {
  const value = normalizeName(name);
  if (!value) return 'nameRequired';
  if (!NAME_PATTERN.test(value)) return 'nameInvalidChars';
  const length = charLength(value);
  if (length < NAME_MIN_LENGTH || length > NAME_MAX_LENGTH) return 'nameLength';
  return null;
}

/**
 * Valida la contraseña SIN modificarla (sin trim ni filtrado de caracteres).
 * `checkMinLength` se desactiva en el login: allí solo decide Supabase.
 */
export function validatePassword(
  password: string,
  { checkMinLength = true }: { checkMinLength?: boolean } = {},
): PasswordError | null {
  if (password.length === 0) return 'passwordRequired';
  const length = charLength(password);
  if (length > PASSWORD_MAX_LENGTH) return 'passwordTooLong';
  if (checkMinLength && length < PASSWORD_MIN_LENGTH) return 'passwordTooShort';
  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): ConfirmError | null {
  return password === confirmation ? null : 'passwordMismatch';
}
