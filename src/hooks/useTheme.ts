import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'commanddeck_theme';

/** Modo claro por defecto; respeta la preferencia guardada si existe. */
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage no disponible: usar valor por defecto
  }
  return 'light';
}

/**
 * Tema global de CommandDeck (pantallas de autenticación y principal).
 * Aplica `data-theme` en <html> y persiste en `commanddeck_theme`.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Si no se puede persistir, el tema sigue funcionando en la sesión actual
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
