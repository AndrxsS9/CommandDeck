import { useI18n } from '../i18n/LanguageContext';
import { ToolIcon } from './ToolIcon';

export const HISTORY_DRAWER_ID = 'history-drawer';

interface HistoryTriggerProps {
  count: number;
  open: boolean;
  onClick: () => void;
}

/** Botón del header que abre el drawer de historial. */
export function HistoryTrigger({ count, open, onClick }: HistoryTriggerProps) {
  const { t } = useI18n();
  const ariaLabel = `${t.header.history} (${count} ${t.recent.saved})`;

  return (
    <button
      id="history-toggle"
      type="button"
      className="history-trigger"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={HISTORY_DRAWER_ID}
    >
      <ToolIcon name="history" />
      <span className="history-trigger__label">{t.header.history}</span>
      {count > 0 && (
        <span className="history-trigger__count" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
