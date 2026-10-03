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

      {/* Search (visual, no funcional aún) */}
      <div className="app-header__search">
        <div className="app-header__search-wrapper">
          <div className="app-header__search-icon">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            className="app-header__search-input"
            placeholder="Buscar comando o solicitar en lenguaje natural..."
            readOnly
          />
          <kbd className="app-header__search-kbd">/</kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="app-header__actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <div className="app-header__status">
          <span className="status-dot" />
          <span className="app-header__status-text">Online</span>
        </div>
      </div>
    </header>
  );
}
