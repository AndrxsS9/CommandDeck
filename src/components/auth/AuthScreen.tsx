import { useState, type ReactNode } from 'react';
import { useI18n } from '../../i18n/LanguageContext';
import { ThemeToggle } from '../ThemeToggle';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type Theme = 'dark' | 'light';
type AuthView = 'login' | 'register';

interface AuthScreenProps {
  theme: Theme;
  onToggleTheme: () => void;
}

/** Marca de CommandDeck reutilizada en las pantallas de autenticación. */
export function AuthBrand() {
  return (
    <div className="auth-brand">
      <div className="auth-brand__logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </div>
      <span className="auth-brand__name">CommandDeck</span>
      <span className="app-header__version">v0.1</span>
    </div>
  );
}

/** Contenedor de página completa (fondo decorativo + controles de idioma/tema). */
export function AuthLayout({ theme, onToggleTheme, children }: AuthScreenProps & { children: ReactNode }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="auth-page">
      <div className="auth-page__glow auth-page__glow--a" aria-hidden="true" />
      <div className="auth-page__glow auth-page__glow--b" aria-hidden="true" />

      <div className="auth-page__controls">
        <button
          id="auth-language-toggle"
          type="button"
          className="lang-toggle"
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          aria-label={t.header.languageAria}
          title={t.header.languageAria}
        >
          <span className={language === 'es' ? 'lang-toggle__opt lang-toggle__opt--active' : 'lang-toggle__opt'}>ES</span>
          <span className={language === 'en' ? 'lang-toggle__opt lang-toggle__opt--active' : 'lang-toggle__opt'}>EN</span>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <main className="auth-page__main">
        <AuthBrand />
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}

/**
 * Pantalla de autenticación independiente (no modal).
 * CommandDeck no se monta mientras esta pantalla está visible.
 */
export function AuthScreen({ theme, onToggleTheme }: AuthScreenProps) {
  const { t } = useI18n();
  const [view, setView] = useState<AuthView>('login');
  const [showConfirmNotice, setShowConfirmNotice] = useState(false);

  function goTo(next: AuthView) {
    setShowConfirmNotice(false);
    setView(next);
  }

  return (
    <AuthLayout theme={theme} onToggleTheme={onToggleTheme}>
      {view === 'login' && (
        <LoginForm
          notice={showConfirmNotice ? t.auth.accountCreatedConfirm : null}
          onSwitchToRegister={() => goTo('register')}
        />
      )}
      {view === 'register' && (
        <RegisterForm
          onSwitchToLogin={() => goTo('login')}
          onNeedsEmailConfirmation={() => {
            setView('login');
            setShowConfirmNotice(true);
          }}
        />
      )}
    </AuthLayout>
  );
}
