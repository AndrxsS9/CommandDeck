import { useId, useState, type InputHTMLAttributes } from 'react';
import { useI18n } from '../../i18n/LanguageContext';
import type { Translations } from '../../i18n/translations';

/** Clave de un mensaje de error de autenticación traducible. */
export type AuthErrorKey = keyof Translations['auth']['errors'];

interface BaseFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string | null;
  hint?: string;
}

/** Mensajes de ayuda/error vinculados al input mediante aria-describedby. */
function useDescribedBy(error?: string | null, hint?: string) {
  const baseId = useId();
  const hintId = hint ? `${baseId}-hint` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
  return { hintId, errorId, describedBy };
}

function FieldMessages({ error, errorId, hint, hintId }: {
  error?: string | null; errorId?: string; hint?: string; hintId?: string;
}) {
  return (
    <>
      {error && <p id={errorId} className="auth-field__error">{error}</p>}
      {hint && !error && <p id={hintId} className="auth-field__hint">{hint}</p>}
    </>
  );
}

export function TextField({ id, label, value, onValueChange, error, hint, type = 'text', ...rest }:
  BaseFieldProps & { type?: 'text' | 'email' }) {
  const { hintId, errorId, describedBy } = useDescribedBy(error, hint);

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>{label}</label>
      <input
        {...rest}
        id={id}
        type={type}
        className={error ? 'auth-input auth-input--invalid' : 'auth-input'}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      <FieldMessages error={error} errorId={errorId} hint={hint} hintId={hintId} />
    </div>
  );
}

/**
 * Campo de contraseña con botón real de mostrar/ocultar.
 * El valor nunca se modifica (sin trim ni filtrado de caracteres).
 */
export function PasswordField({ id, label, value, onValueChange, error, hint, ...rest }: BaseFieldProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const { hintId, errorId, describedBy } = useDescribedBy(error, hint);
  const toggleLabel = visible ? t.auth.hidePassword : t.auth.showPassword;

  return (
    <div className="auth-field">
      <label className="auth-field__label" htmlFor={id}>{label}</label>
      <div className="auth-password">
        <input
          {...rest}
          id={id}
          type={visible ? 'text' : 'password'}
          className={error ? 'auth-input auth-input--invalid' : 'auth-input'}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <button
          type="button"
          id={`${id}-toggle`}
          className="auth-password__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={toggleLabel}
          aria-pressed={visible}
          title={toggleLabel}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      <FieldMessages error={error} errorId={errorId} hint={hint} hintId={hintId} />
    </div>
  );
}

/** Mensaje de estado del formulario (error o éxito), anunciado a lectores de pantalla. */
export function FormAlert({ kind, message }: { kind: 'error' | 'success'; message: string | null }) {
  if (!message) return null;
  return (
    <div className={`auth-alert auth-alert--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {message}
    </div>
  );
}
