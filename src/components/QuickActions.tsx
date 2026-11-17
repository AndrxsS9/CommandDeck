import { useI18n } from '../i18n/LanguageContext';
import { ToolIcon, type ToolIconName } from './ToolIcon';

interface QuickActionsProps {
  /** Rellena el traductor con la intención de la plantilla. No genera ni ejecuta nada. */
  onUse: (intent: string) => void;
}

const ACTIONS: { key: 'git' | 'docker' | 'kubernetes'; icon: ToolIconName }[] = [
  { key: 'git', icon: 'git' },
  { key: 'docker', icon: 'docker' },
  { key: 'kubernetes', icon: 'kubernetes' },
];

export function QuickActions({ onUse }: QuickActionsProps) {
  const { t } = useI18n();

  return (
    <section className="quick-actions" aria-labelledby="quick-actions-title">
      <div className="quick-actions__header">
        <h2 id="quick-actions-title" className="quick-actions__title">{t.quickActions.title}</h2>
        <p className="quick-actions__subtitle">{t.quickActions.subtitle}</p>
      </div>

      <div className="quick-actions__grid">
        {ACTIONS.map(({ key, icon }) => {
          const item = t.quickActions.items[key];
          return (
            <div key={key} className="quick-action-card">
              <div className="quick-action-card__icon">
                <ToolIcon name={icon} />
              </div>
              <div className="quick-action-card__text">
                <span className="quick-action-card__title">{t.tools[key]}</span>
                <span className="quick-action-card__subtitle">{item.subtitle}</span>
              </div>
              <button
                type="button"
                className="quick-action-card__btn"
                onClick={() => onUse(item.intent)}
                aria-label={`${t.quickActions.use}: ${item.subtitle}`}
              >
                {t.quickActions.use}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
