import { useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { mapAuthError } from '../../auth/authService';
import { normalizeEmail, validateEmail, validatePassword, PASSWORD_MAX_LENGTH } from '../../auth/validation';
import { useI18n } from '../../i18n/LanguageContext';
import { FormAlert, PasswordField, TextField, type AuthErrorKey } from './AuthFields';

interface LoginFormProps {
  /** Mensaje de éxito previo (p. ej. tras crear la cuenta). */
  notice?: string | null;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

type LoginErrors = { email?: AuthErrorKey | null; password?: AuthErrorKey | null };

export function LoginForm({ notice, onSwitchToRegister, onSwitchToForgotPassword }: LoginFormProps) {
  const { t } = useI18n();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Se guardan códigos (no textos) para que cambien al alternar el idioma.
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const tr = (key?: AuthErrorKey | null) => (key ? t.auth.errors[key] : null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return; // impide doble envío

    const emailError = validateEmail(email);
    // En el login solo se valida longitud máxima; la política la decide Supabase.
    const passwordError = validatePassword(password, { checkMinLength: false });
    setErrors({ email: emailError, password: passwordError });
    setFormError(null);
    if (emailError || passwordError) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await signIn(normalizeEmail(email), password);
      // Al iniciar sesión, AuthProvider cambia la vista a CommandDeck.
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
        <h1 className="auth-card__title">{t.auth.welcomeTitle}</h1>
        <p className="auth-card__subtitle">{t.auth.welcomeSubtitle}</p>
      </div>

      <FormAlert kind="success" message={notice ?? null} />
      <FormAlert kind="error" message={tr(formError)} />

      <TextField
        id="login-email"
        type="email"
        label={t.auth.email}
        placeholder={t.auth.emailPlaceholder}
        autoComplete="email"
        value={email}
        onValueChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: null })); }}
        error={tr(errors.email)}
        disabled={submitting}
        autoFocus
      />

      <PasswordField
        id="login-password"
        label={t.auth.password}
        autoComplete="current-password"
        maxLength={PASSWORD_MAX_LENGTH}
        value={password}
        onValueChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null })); }}
        error={tr(errors.password)}
        disabled={submitting}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
        <button
          id="go-to-forgot-password"
          type="button"
          className="auth-link"
          style={{ fontSize: '12px' }}
          onClick={onSwitchToForgotPassword}
        >
          {t.auth.forgotPasswordLink}
        </button>
      </div>

      <button id="login-submit" type="submit" className="auth-submit" disabled={submitting}>
        {submitting && <span className="auth-submit__spinner" aria-hidden="true" />}
        {submitting ? t.auth.signingIn : t.auth.signIn}
      </button>

      <p className="auth-switch">
        {t.auth.noAccount}{' '}
        <button id="go-to-register" type="button" className="auth-link" onClick={onSwitchToRegister}>
          {t.auth.createAccount}
        </button>
      </p>
    </form>
  );
}
