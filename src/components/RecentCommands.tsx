import { useState, useEffect, forwardRef } from 'react';
import { getHistory, clearHistory, type HistoryEntry } from '../services/historyService';
import { ToolIcon, type ToolIconName } from './ToolIcon';

const toolLabels: Record<string, string> = {
  git: 'Git',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  unknown: 'Desconocido', 
  system: 'Sistema',
};

interface RecentCommandsProps {
  onReuse: (intent: string) => void;
}

export const RecentCommands = forwardRef<HTMLElement, RecentCommandsProps>(({ onReuse }, ref) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());

    const onUpdate = () => {
      setHistory(getHistory());
    };

    window.addEventListener('history_updated', onUpdate);
    return () => window.removeEventListener('history_updated', onUpdate);
  }, []);

  return (
    <aside className="recent-panel" ref={ref}>
      <div className="recent-panel__header">
        <div className="recent-panel__title">
          <ToolIcon name="history" />
          <span>Recientes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="recent-panel__count">{history.length} guardados</span>
          {history.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres limpiar el historial?')) {
                  clearHistory();
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textDecoration: 'underline'
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="recent-panel__list">
        {history.map((item) => (
          <div key={item.id} className="recent-item">
            <div className="recent-item__header">
              <span className="recent-item__tool">
                <ToolIcon name={(item.tool as ToolIconName) || 'unknown'} />
                {toolLabels[item.tool] || toolLabels['unknown']}
              </span>
              <button
                className="recent-item__reuse"
                onClick={() => onReuse(item.intent)}
                aria-label={`Reutilizar ${item.intent}`}
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
          Describe → Genera → Revisa parámetros y nivel de riesgo antes de copiar el comando.
        </p>
      </div>
    </aside>
  );
});
