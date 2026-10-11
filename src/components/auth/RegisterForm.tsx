import { useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { mapAuthError } from '../../auth/authService';
import {
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  normalizeEmail,
  normalizeName,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordConfirmation,
} from '../../auth/validation';
import { useI18n } from '../../i18n/LanguageContext';
import { FormAlert, PasswordField, TextField, type AuthErrorKey } from './AuthFields';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  /** Se llama cuando Supabase exige confirmar el correo antes de entrar. */
  onNeedsEmailConfirmation: () => void;
}

type Field = 'name' | 'email' | 'password' | 'confirm';
type RegisterErrors = Partial<Record<Field, AuthErrorKey | null>>;

export function RegisterForm({ onSwitchToLogin, onNeedsEmailConfirmation }: RegisterFormProps) {
  const { t } = useI18n();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const tr = (key?: AuthErrorKey | null) => (key ? t.auth.errors[key] : null);
  const clear = (field: Field) => setErrors((e) => ({ ...e, [field]: null }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return; // impide doble envío

    const next: RegisterErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validatePasswordConfirmation(password, confirm),
    };
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      // La contraseña se envía exactamente como se escribió (sin trim).
      const { needsEmailConfirmation } = await signUp(
        normalizeName(name),
        normalizeEmail(email),
        password,
      );
      // Si hay sesión inmediata, AuthProvider muestra CommandDeck automáticamente.
      if (needsEmailConfirmation) onNeedsEmailConfirmation();
    } catch (error) {
      setFormError(mapAuthError(error));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-card__heading">
        <h1 className="auth-card__title">{t.auth.registerTitle}</h1>
        <p className="auth-card__subtitle">{t.auth.registerSubtitle}</p>
      </div>

      <FormAlert kind="error" message={tr(formError)} />

      <TextField
        id="register-name"
        label={t.auth.name}
        placeholder={t.auth.namePlaceholder}
        autoComplete="name"
        maxLength={NAME_MAX_LENGTH + 20 /* margen para espacios que se normalizan */}
        value={name}
        onValueChange={(v) => { setName(v); clear('name'); }}
        error={tr(errors.name)}
        disabled={submitting}
        autoFocus
      />

      <TextField
        id="register-email"
        type="email"
        label={t.auth.email}
        placeholder={t.auth.emailPlaceholder}
        autoComplete="email"
        value={email}
        onValueChange={(v) => { setEmail(v); clear('email'); }}
        error={tr(errors.email)}
        disabled={submitting}
      />

      <PasswordField
        id="register-password"
        label={t.auth.password}
        autoComplete="new-password"
        maxLength={PASSWORD_MAX_LENGTH}
        value={password}
        onValueChange={(v) => { setPassword(v); clear('password'); }}
        error={tr(errors.password)}
        hint={t.auth.passwordHint}
        disabled={submitting}
      />

      <PasswordField
        id="register-confirm-password"
        label={t.auth.confirmPassword}
        autoComplete="new-password"
        maxLength={PASSWORD_MAX_LENGTH}
        value={confirm}
        onValueChange={(v) => { setConfirm(v); clear('confirm'); }}
        error={tr(errors.confirm)}
        disabled={submitting}
      />

      <button id="register-submit" type="submit" className="auth-submit" disabled={submitting}>
        {submitting && <span className="auth-submit__spinner" aria-hidden="true" />}
        {submitting ? t.auth.creatingAccount : t.auth.createAccount}
      </button>

      <p className="auth-switch">
        {t.auth.haveAccount}{' '}
        <button id="go-to-login" type="button" className="auth-link" onClick={onSwitchToLogin}>
          {t.auth.signIn}
        </button>
      </p>
    </form>
  );
}
