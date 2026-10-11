import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useI18n } from '../i18n/LanguageContext';
import { useAuth } from '../auth/AuthContext';
import { mapAuthError } from '../auth/authService';

interface AppHeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  const { language, setLanguage, t } = useI18n();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const fullName = user?.user_metadata?.full_name;
  const displayName = (typeof fullName === 'string' && fullName.trim()) || user?.email || '';

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      // Al cerrar sesión, AuthProvider vuelve automáticamente al Login.
      await signOut();
    } catch (error) {
      window.alert(t.auth.errors[mapAuthError(error)]);
      setSigningOut(false);
    }
  }

  return (
    <header className="app-header">
      {/* Brand */}
      <div className="app-header__brand">
        <div className="app-header__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        </div>
        <span className="app-header__title">CommandDeck</span>
        <span className="app-header__version">v0.1</span>
      </div>

      {/* Info HotKey */}
      <div className="app-header__search">
        <div className="app-header__search-wrapper" style={{ background: 'transparent', border: 'none' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            {t.header.hotkeyHint}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="app-header__actions">
        <button
          id="language-toggle"
          className="lang-toggle"
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          aria-label={t.header.languageAria}
          title={t.header.languageAria}
        >
          <span className={language === 'es' ? 'lang-toggle__opt lang-toggle__opt--active' : 'lang-toggle__opt'}>ES</span>
          <span className={language === 'en' ? 'lang-toggle__opt lang-toggle__opt--active' : 'lang-toggle__opt'}>EN</span>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="app-header__user">
          <span className="app-header__user-name" title={displayName}>{displayName}</span>
          <button
            id="sign-out"
            className="app-header__user-signout"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? t.auth.signingOut : t.auth.signOut}
          </button>
        </div>
      </div>
    </header>
  );
}
