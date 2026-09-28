import type { RiskLevel } from '../types/command';

const labels: Record<RiskLevel, string> = {
  read: 'LECTURA',
  low: 'BAJO',
  medium: 'MEDIO',
  critical: 'CRÍTICO',
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`risk-badge risk-${level}`}>RIESGO · {labels[level]}</span>;
}
