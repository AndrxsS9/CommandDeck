import { useI18n } from '../i18n/LanguageContext';

interface CommandExplanationProps {
  explanation: string[];
}

export function CommandExplanation({ explanation }: CommandExplanationProps) {
  const { t } = useI18n();

  if (explanation.length === 0) return null;

  /**
   * Intenta separar cada línea de explicación en
   * código + descripción si contiene `:`.
   * Ejemplo: "git log → Muestra historial de commits."
   */
  function parseItem(item: string): { code: string; desc: string } | null {
    // Formato "parte: explicación"
    const colonMatch = item.match(/^([^:]+):\s*(.+)$/);
    if (colonMatch) {
      return { code: colonMatch[1].trim(), desc: colonMatch[2].trim() };
    }

    // Formato "parte → explicación"
    const arrowMatch = item.match(/^([^→]+)→\s*(.+)$/);
    if (arrowMatch) {
      return { code: arrowMatch[1].trim(), desc: arrowMatch[2].trim() };
    }

    return null;
  }

  return (
    <div className="params-breakdown">
      <div className="params-breakdown__title">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <span>{t.result.paramsBreakdown}</span>
      </div>
      <div className="params-breakdown__list">
        {explanation.map((item, i) => {
          const parsed = parseItem(item);
          if (parsed) {
            return (
              <div key={i} className="params-breakdown__item">
                <code className="params-breakdown__code">{parsed.code}</code>
                <span className="params-breakdown__arrow">→</span>
                <span className="params-breakdown__desc">{parsed.desc}</span>
              </div>
            );
          }
          return (
            <div key={i} className="params-breakdown__item">
              <span className="params-breakdown__desc">{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
