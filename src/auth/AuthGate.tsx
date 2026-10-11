import App from '../App';
import { AuthScreen } from '../components/auth/AuthScreen';
import { AuthConfigErrorScreen, AuthLoadingScreen } from '../components/auth/AuthStatusScreens';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from './AuthContext';

/**
 * Decide qué pantalla se monta según la sesión de Supabase.
 *
 * CommandDeck (App) solo se monta con una sesión y un usuario válidos;
 * nunca se oculta con CSS detrás del login.
 */
export function AuthGate() {
  const { theme, toggleTheme } = useTheme();
  const { session, user, loading, configured } = useAuth();

  if (!configured) return <AuthConfigErrorScreen />;
  if (loading) return <AuthLoadingScreen />;
  if (!session || !user) return <AuthScreen theme={theme} onToggleTheme={toggleTheme} />;

  // key={user.id}: al cambiar de usuario se remonta el workspace sin restos del anterior.
  return <App key={user.id} userId={user.id} theme={theme} onToggleTheme={toggleTheme} />;
}
