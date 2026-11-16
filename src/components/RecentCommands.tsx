import { useEffect, useRef } from 'react';
import { clearHistory, type HistoryEntry } from '../services/historyService';
import { useI18n } from '../i18n/LanguageContext';
import type { Translations } from '../i18n/translations';
import { ToolIcon, type ToolIconName } from './ToolIcon';
import { HISTORY_DRAWER_ID } from './HistoryTrigger';

interface RecentCommandsProps {
  /** Si el drawer está visible. */
  open: boolean;
  /** Cierra el drawer (botón X, overlay o Escape). */
  onClose: () => void;
  /** Recibe la intención original del registro a reutilizar. */
  onReuse: (intent: string) => void;
  /** Registros del usuario (ver useHistory). */
  entries: HistoryEntry[];
  userId?: string;
}

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function formatRecentDate(ts: number, t: Translations) {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  const locale = t.history.locale;

  if (isToday) {
    return `${t.recent.today}, ${date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** Drawer lateral derecho con el historial del usuario autenticado. */
export function RecentCommands({ open, onClose, onReuse, entries, userId }: RecentCommandsProps) {
  const { t } = useI18n();
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Escape, foco inicial, ciclo de Tab dentro del drawer y retorno del foco al cerrar
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !drawerRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !drawerRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Devolver el foco solo si sigue dentro del drawer (al reutilizar, el input ya lo tomó)
      const active = document.activeElement;
      const focusLeftInDrawer = !active || active === document.body || drawerRef.current?.contains(active);
      if (focusLeftInDrawer) {
        previouslyFocused?.focus();
      }
    };
  }, [open]);

  function handleClear() {
    if (window.confirm(t.recent.clearConfirm)) {
      clearHistory(userId);
    }
  }

  return (
    <>
      <div
        className={open ? 'history-overlay history-overlay--open' : 'history-overlay'}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        id={HISTORY_DRAWER_ID}
        className={open ? 'history-drawer history-drawer--open' : 'history-drawer'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-drawer-title"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="history-drawer__header">
          <div className="history-drawer__heading">
            <h2 id="history-drawer-title" className="history-drawer__title">
              <ToolIcon name="history" />
              {t.history.title}
            </h2>
            <span className="history-drawer__count">
              {entries.length} {t.recent.saved}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="history-drawer__close"
            onClick={onClose}
            aria-label={t.history.close}
            title={t.history.close}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="history-drawer__body">
          {entries.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty__icon" aria-hidden="true">
                <ToolIcon name="history" />
              </div>
              <p className="history-empty__text">{t.history.empty}</p>
              <div className="tip-card">
                <div className="tip-card__title">
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  {t.recent.tipTitle}
                </div>
                <p className="tip-card__text">{t.recent.tipText}</p>
              </div>
            </div>
          ) : (
            <ul className="history-drawer__list">
              {entries.map((item) => (
                <li key={item.id} className="recent-item">
                  <div className="recent-item__header">
                    <span className="recent-item__tool">
                      <ToolIcon name={(item.tool as ToolIconName) || 'unknown'} />
                      {t.tools[item.tool] || t.tools['unknown']}
                    </span>
                    <span className={`recent-item__risk recent-item__risk--${item.risk}`}>
                      <span aria-hidden="true">●</span> {t.risk.labels[item.risk as keyof typeof t.risk.labels] || item.risk}
                    </span>
                    <span className="recent-item__time">{formatRecentDate(item.timestamp, t)}</span>
                  </div>
                  <code className="recent-item__command">{item.command}</code>
                  {item.desc && (
                    <p className="recent-item__desc" title={item.desc}>{item.desc}</p>
                  )}
                  <div className="recent-item__footer">
                    <button
                      type="button"
                      className="recent-item__reuse"
                      onClick={() => onReuse(item.intent)}
                      aria-label={`${t.recent.reuseAria} ${item.intent}`}
                    >
                      {t.recent.reuse}
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <polyline points="7 17 17 7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <footer className="history-drawer__footer">
            <button
              id="clear-history"
              type="button"
              className="history-drawer__clear"
              onClick={handleClear}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              {t.recent.clear}
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
