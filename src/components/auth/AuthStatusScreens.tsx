import { useI18n } from '../../i18n/LanguageContext';
import { AuthBrand } from './AuthScreen';

/** Pantalla mínima mientras se comprueba la sesión (evita parpadeos Login/CommandDeck). */
export function AuthLoadingScreen() {
  const { t } = useI18n();

  return (
    <div className="auth-page auth-page--status">
      <main className="auth-page__main" aria-busy="true">
        <AuthBrand />
        <div className="auth-status" role="status">
          <span className="loading-state__spinner" aria-hidden="true" />
          <p className="auth-status__text">{t.auth.checkingSession}</p>
        </div>
      </main>
    </div>
  );
}

/** Se muestra si faltan VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. */
export function AuthConfigErrorScreen() {
  const { t } = useI18n();

  return (
    <div className="auth-page auth-page--status">
      <main className="auth-page__main">
        <AuthBrand />
        <div className="auth-card">
          <div className="auth-form">
            <div className="auth-card__heading">
              <h1 className="auth-card__title">{t.auth.configTitle}</h1>
              <p className="auth-card__subtitle">{t.auth.configText}</p>
            </div>
            <code className="auth-config__vars">
              VITE_SUPABASE_URL{'\n'}VITE_SUPABASE_PUBLISHABLE_KEY
            </code>
          </div>
        </div>
      </main>
    </div>
  );
}
