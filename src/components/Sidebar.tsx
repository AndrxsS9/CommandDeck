import type { CommandTool } from '../types/command';

/** Ícono SVG para cada herramienta del sidebar */
const toolIcons: Record<string, JSX.Element> = {
  home: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  git: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  docker: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="M17 7V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v3" />
      <line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
  ),
  kubernetes: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
    </svg>
  ),
  system: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <polyline points="7 8 11 12 7 16" />
      <line x1="13" y1="16" x2="17" y2="16" />
    </svg>
  ),
  history: (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

interface SidebarItem {
  id: string;
  label: string;
  tool?: CommandTool;
  icon: string;
  disabled?: boolean;
}

const navItems: SidebarItem[] = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'git', label: 'Comandos Git', tool: 'git', icon: 'git' },
  { id: 'docker', label: 'Contenedores Docker', tool: 'docker', icon: 'docker' },
  { id: 'kubernetes', label: 'Kubernetes', icon: 'kubernetes', disabled: true },
  { id: 'system', label: 'Comandos Linux', tool: 'system', icon: 'system' },
  { id: 'history', label: 'Historial', icon: 'history' },
];

interface SidebarProps {
  activeItem: string;
  onSelectItem: (id: string) => void;
}

export function Sidebar({ activeItem, onSelectItem }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__nav-label">Navegación</div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar__nav-item ${
                activeItem === item.id ? 'sidebar__nav-item--active' : ''
              } ${item.disabled ? 'sidebar__nav-item--disabled' : ''}`}
              onClick={() => !item.disabled && onSelectItem(item.id)}
              disabled={item.disabled}
              title={item.disabled ? 'Próximamente' : item.label}
            >
              {toolIcons[item.icon]}
              <span>{item.label}</span>
              {item.disabled && (
                <span className="sidebar__coming-soon">Próximamente</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Footer status */}
      <div className="sidebar__footer">
        <div className="sidebar__footer-status">
          <span className="status-dot" />
          <span className="sidebar__footer-label">Motor IA Activo</span>
        </div>
      </div>
    </aside>
  );
}
