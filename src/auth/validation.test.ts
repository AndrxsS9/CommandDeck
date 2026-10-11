import { describe, it, expect } from 'vitest';
import {
  normalizeName,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from './validation';

describe('validateName', () => {
  it.each(['Andrés', 'María José', 'Carlos Alberto', 'José Manuel Yela', 'Ana María López', 'ÑANDÚ Ü'])(
    'acepta "%s"',
    (name) => {
      expect(validateName(name)).toBeNull();
    },
  );

  it.each(['And1res', 'Juan@', 'Carlos_', 'Pedro-123', 'José#', 'Andrés99', 'Juan-Pedro', 'Carlos#'])(
    'rechaza caracteres no permitidos en "%s"',
    (name) => {
      expect(validateName(name)).toBe('nameInvalidChars');
    },
  );

  it('rechaza nombres con menos de 5 caracteres', () => {
    expect(validateName('ABC')).toBe('nameLength');
    expect(validateName('Ana')).toBe('nameLength');
    expect(validateName('  Luis  ')).toBe('nameLength');
  });

  it('acepta exactamente 5 y 80 caracteres', () => {
    expect(validateName('Pedro')).toBeNull();
    expect(validateName('á'.repeat(80))).toBeNull();
  });

  it('rechaza más de 80 caracteres', () => {
    expect(validateName('a'.repeat(81))).toBe('nameLength');
  });

  it('exige el nombre', () => {
    expect(validateName('   ')).toBe('nameRequired');
  });

  it('normaliza espacios y tildes descompuestas', () => {
    expect(normalizeName('  María    José  ')).toBe('María José');
    // "e" + acento combinado (U+0301) se compone en "é"
    expect(validateName('Andre\u0301s')).toBeNull();
    expect(normalizeName('Andre\u0301s')).toBe('Andrés');
  });
});

describe('validateEmail', () => {
  it('acepta correos razonables (con trim)', () => {
    expect(validateEmail('usuario@correo.com')).toBeNull();
    expect(validateEmail('  usuario@correo.com  ')).toBeNull();
  });

  it('rechaza correos inválidos', () => {
    expect(validateEmail('')).toBe('emailRequired');
    expect(validateEmail('usuario')).toBe('emailInvalid');
    expect(validateEmail('usuario@correo')).toBe('emailInvalid');
    expect(validateEmail('usu ario@correo.com')).toBe('emailInvalid');
  });
});

describe('validatePassword', () => {
  it.each(['abcdef', 'Abc123', 'MiClave!2026', '@#$_123ABCabc', 'contraseña ñ€ ¿?¡! *&%+-'])(
    'acepta "%s" sin restringir caracteres',
    (password) => {
      expect(validatePassword(password)).toBeNull();
    },
  );

  it('acepta 100 caracteres y rechaza 101', () => {
    expect(validatePassword('a'.repeat(100))).toBeNull();
    expect(validatePassword('a'.repeat(101))).toBe('passwordTooLong');
  });

  it('respeta el mínimo de Supabase en el registro', () => {
    expect(validatePassword('abc12')).toBe('passwordTooShort');
  });

  it('no aplica el mínimo en el login', () => {
    expect(validatePassword('abc', { checkMinLength: false })).toBeNull();
    expect(validatePassword('a'.repeat(101), { checkMinLength: false })).toBe('passwordTooLong');
  });

  it('no recorta espacios: una contraseña de espacios es válida', () => {
    expect(validatePassword('      ')).toBeNull();
    expect(validatePassword('')).toBe('passwordRequired');
  });
});

describe('validatePasswordConfirmation', () => {
  it('exige coincidencia exacta (sin trim)', () => {
    expect(validatePasswordConfirmation('MiClave!2026', 'MiClave!2026')).toBeNull();
    expect(validatePasswordConfirmation('MiClave!2026', 'MiClave!2026 ')).toBe('passwordMismatch');
  });
});
