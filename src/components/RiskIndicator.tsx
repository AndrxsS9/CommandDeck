import type { RiskLevel } from '../types/command';

const riskLabels: Record<RiskLevel, string> = {
  read: 'Lectura',
  low: 'Bajo',
  medium: 'Medio',
  critical: 'Crítico',
};

const riskMessages: Record<RiskLevel, string> = {
  read: 'Sin patrones destructivos detectados',
  low: 'Riesgo bajo según análisis local',
  medium: 'Requiere revisión antes de continuar',
  critical: 'Acción crítica',
};

const riskIcons: Record<RiskLevel, JSX.Element> = {
  read: (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  low: (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  medium: (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  critical: (
    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

interface RiskIndicatorProps {
  level: RiskLevel;
  reasons: string[];
}

export function RiskIndicator({ level, reasons }: RiskIndicatorProps) {
  const riskClass = level === 'read' || level === 'low' ? 'read' : level;

  return (
    <div className={`risk-panel risk-panel--${riskClass}`}>
      <div>
        <div className="risk-panel__header">
          <span className="risk-panel__title">Nivel de Riesgo</span>
          <span className="risk-panel__badge">
            {riskIcons[level]}
            {riskLabels[level]}
          </span>
        </div>
        {reasons.length > 0 && (
          <p className="risk-panel__description">
            {reasons[0]}
          </p>
        )}
      </div>
      <div className="risk-panel__footer">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>{riskMessages[level]}</span>
      </div>
    </div>
  );
}
