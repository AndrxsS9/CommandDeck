import type { CommandTool } from '../types/command';

interface RecentCommand {
  id: string;
  tool: CommandTool;
  command: string;
  desc: string;
}

const mockRecentCommands: RecentCommand[] = [
  { id: '1', tool: 'git', command: 'git status', desc: 'Ver estado del árbol de trabajo' },
  { id: '2', tool: 'docker', command: 'docker ps -a', desc: 'Listar todos los contenedores' },
  { id: '3', tool: 'unknown', command: 'kubectl get pods -A', desc: 'Listar pods de todos los namespaces' },
  { id: '4', tool: 'system', command: 'ls -la --color=auto', desc: 'Listado detallado con permisos' },
];

const toolIcons: Record<string, JSX.Element> = {
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
  unknown: (
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
};

const toolLabels: Record<string, string> = {
  git: 'Git',
  docker: 'Docker',
  unknown: 'Kubernetes',
  system: 'Linux',
};

interface RecentCommandsProps {
  onReuse: (command: string) => void;
}

export function RecentCommands({ onReuse }: RecentCommandsProps) {
  return (
    <aside className="recent-panel">
      <div className="recent-panel__header">
        <div className="recent-panel__title">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Recientes</span>
        </div>
        <span className="recent-panel__count">4 guardados</span>
      </div>

      <div className="recent-panel__list">
        {mockRecentCommands.map((item) => (
          <div key={item.id} className="recent-item">
            <div className="recent-item__header">
              <span className="recent-item__tool">
                {toolIcons[item.tool]}
                {toolLabels[item.tool]}
              </span>
              <button
                className="recent-item__reuse"
                onClick={() => onReuse(item.command)}
                aria-label={`Reutilizar ${item.command}`}
              >
                Reutilizar
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="7 17 17 7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </button>
            </div>
            <code className="recent-item__command">{item.command}</code>
            <p className="recent-item__desc" title={item.desc}>{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="tip-card">
        <div className="tip-card__title">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Flujo recomendado
        </div>
        <p className="tip-card__text">
          Describe → Genera → Revisa parámetros y nivel de riesgo antes de copiar o simular.
        </p>
      </div>
    </aside>
  );
}
