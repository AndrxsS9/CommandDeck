import { useI18n } from '../i18n/LanguageContext';

export function LoadingState() {
  const { t } = useI18n();

  return (
    <div className="loading-state">
      <div className="loading-state__spinner" />
      <div>
        <div className="loading-state__text">{t.loading.text}</div>
        <div className="loading-state__subtext">{t.loading.subtext}</div>
      </div>
    </div>
  );
}
