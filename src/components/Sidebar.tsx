import type { CommandTool } from '../types/command';
import { ToolIcon, type ToolIconName } from './ToolIcon';

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
  { id: 'kubernetes', label: 'Kubernetes', tool: 'kubernetes', icon: 'kubernetes' },
  { id: 'system', label: 'Comandos del sistema', tool: 'system', icon: 'system' },
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
              <ToolIcon name={item.icon as ToolIconName} />
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
          <span className="sidebar__footer-label">Asistente disponible</span>
        </div>
      </div>
    </aside>
  );
}
