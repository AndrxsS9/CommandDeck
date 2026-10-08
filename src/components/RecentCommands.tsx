import { useState, useEffect } from 'react';
import { getHistory, clearHistory, type HistoryEntry } from '../services/historyService';
import { useI18n } from '../i18n/LanguageContext';
import { ToolIcon, type ToolIconName } from './ToolIcon';

interface RecentCommandsProps {
  onReuse: (intent: string) => void;
}

function formatRecentDate(ts: number, t: any) {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const locale = t.history.locale;

  if (isToday) {
    return `${t.recent.today}, ${date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function RecentCommands({ onReuse }: RecentCommandsProps) {
  const { t } = useI18n();
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
    <aside className="recent-panel">
      <div className="recent-panel__header">
        <div className="recent-panel__title">
          <ToolIcon name="history" />
          <span>{t.recent.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="recent-panel__count">{history.length} {t.recent.saved}</span>
          {history.length > 0 && (
            <button
              id="clear-history"
              onClick={() => {
                if (window.confirm(t.recent.clearConfirm)) {
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
              {t.recent.clear}
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
                {t.tools[item.tool] || t.tools['unknown']}
              </span>
              <span className={`recent-item__risk recent-item__risk--${item.risk}`}>
                {item.risk === 'critical' ? '●' : item.risk === 'medium' ? '●' : '●'} {t.risk.labels[item.risk as keyof typeof t.risk.labels] || item.risk}
              </span>
              <span className="recent-item__time">{formatRecentDate(item.timestamp, t)}</span>
            </div>
            <code className="recent-item__command">{item.command}</code>
            <p className="recent-item__desc" title={item.desc}>{item.desc}</p>
            <div className="recent-item__footer">
              <button
                className="recent-item__reuse"
                onClick={() => onReuse(item.intent)}
                aria-label={`${t.recent.reuseAria} ${item.intent}`}
              >
                {t.recent.reuse}
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="7 17 17 7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </button>
            </div>
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
          {t.recent.tipTitle}
        </div>
        <p className="tip-card__text">
          {t.recent.tipText}
        </p>
      </div>
    </aside>
  );
}
