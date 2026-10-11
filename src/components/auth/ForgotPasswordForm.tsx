import { useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { mapAuthError } from '../../auth/authService';
import { normalizeEmail, validateEmail } from '../../auth/validation';
import { useI18n } from '../../i18n/LanguageContext';
import { FormAlert, TextField, type AuthErrorKey } from './AuthFields';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const { t } = useI18n();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<AuthErrorKey | null>(null);
  const [formError, setFormError] = useState<AuthErrorKey | null>(null);
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const tr = (key?: AuthErrorKey | null) => (key ? t.auth.errors[key] : null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;

    const error = validateEmail(email);
    setEmailError(error);
    setFormError(null);
    setSentNotice(null);
    if (error) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      await resetPassword(normalizeEmail(email));
      setSentNotice(t.auth.resetEmailSent);
    } catch (err) {
      setFormError(mapAuthError(err));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-card__heading">
        <h1 className="auth-card__title">{t.auth.forgotPasswordTitle}</h1>
        <p className="auth-card__subtitle">{t.auth.forgotPasswordSubtitle}</p>
      </div>

      <FormAlert kind="success" message={sentNotice} />
      <FormAlert kind="error" message={tr(formError)} />

      <TextField
        id="forgot-email"
        type="email"
        label={t.auth.email}
        placeholder={t.auth.emailPlaceholder}
        autoComplete="email"
        value={email}
        onValueChange={(v) => { setEmail(v); setEmailError(null); }}
        error={tr(emailError)}
        disabled={submitting}
        autoFocus
      />

      <button id="forgot-submit" type="submit" className="auth-submit" disabled={submitting}>
        {submitting && <span className="auth-submit__spinner" aria-hidden="true" />}
        {submitting ? t.auth.sendingInstructions : t.auth.sendInstructions}
      </button>

      <p className="auth-switch">
        <button id="back-to-login" type="button" className="auth-link" onClick={onBackToLogin}>
          {t.auth.backToLogin}
        </button>
      </p>
    </form>
  );
}
