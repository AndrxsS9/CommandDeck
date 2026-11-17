import { useI18n } from '../i18n/LanguageContext';
import { ToolIcon } from './ToolIcon';

/**
 * Fila de indicadores de contexto del sistema.
 * Es puramente visual: no detecta plataforma ni consulta el estado de Gemini.
 */
export function SystemContext() {
  const { t } = useI18n();

  return (
    <ul className="context-chips" aria-label={t.context.ariaLabel}>
      <li className="context-chip">
        <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 5.5 10.5 4.5v7H3zM11.5 4.4 21 3v8.5h-9.5zM3 12.5h7.5v7L3 18.5zM11.5 12.5H21V21l-9.5-1.4z" />
        </svg>
        Windows
      </li>
      <li className="context-chip">
        <ToolIcon name="system" />
        PowerShell
      </li>
      <li className="context-chip">
        <span className="context-chip__dot" aria-hidden="true" />
        {t.context.geminiReady}
      </li>
      <li className="context-chip">
        <ToolIcon name="auto" />
        {t.context.autoMode}
      </li>
    </ul>
  );
}
