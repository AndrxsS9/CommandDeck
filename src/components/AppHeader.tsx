import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
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
            Alt + Space para abrir · Ctrl + Alt + Space si no está disponible
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="app-header__actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="app-header__status">
          <span className="status-dot" />
          <span className="app-header__status-text">CommandDeck listo</span>
        </div>
      </div>
    </header>
  );
}
