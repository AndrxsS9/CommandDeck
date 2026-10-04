import type { CommandResult, PlatformContext } from '../types/command';
import { CommandExplanation } from './CommandExplanation';
import { RiskIndicator } from './RiskIndicator';

interface CommandResultCardProps {
  result: CommandResult & { platformContext?: PlatformContext };
  onCopy: () => void;
  onNewQuery: () => void;
  copied: boolean;
}

const OS_LABELS: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};

const SHELL_LABELS: Record<string, string> = {
  powershell: 'PowerShell',
  cmd: 'CMD',
  bash: 'Bash',
  zsh: 'Zsh',
};

function getPlatformLabel(ctx?: PlatformContext): string {
  if (!ctx) return 'Plataforma no determinada';

  const { os, shell } = ctx;
  const osLabel = OS_LABELS[os];
  const shellLabel = SHELL_LABELS[shell];

  if (!osLabel && !shellLabel) return 'Plataforma no determinada';
  if (!osLabel) return `Shell inferida: ${shellLabel}`;
  if (!shellLabel) return `${osLabel} / Shell no determinada`;
  return `${osLabel} / ${shellLabel}`;
}

export function CommandResultCard({ result, onCopy, onNewQuery, copied }: CommandResultCardProps) {
  return (
    <section className="command-result">
      {/* Header */}
      <div className="command-result__header">
        <span className="command-result__label">Resultado Generado</span>
        <span className="command-result__shell-tag">{getPlatformLabel(result.platformContext)}</span>
      </div>

      {/* Terminal box */}
      <div className="command-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <span className="command-box__prompt">$</span>
          <span className="command-box__text">{result.command}</span>
        </div>
        <div className="command-box__actions">
          <button className="btn-secondary" onClick={onCopy}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="summary-card">
        {result.summary}
      </div>

      {/* Grid: Breakdown + Risk */}
      <div className="result-details-grid">
        <CommandExplanation explanation={result.explanation} />
        <RiskIndicator level={result.risk} reasons={result.riskReasons} />
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border-primary)' }}>
        <button className="btn-new-query" onClick={onNewQuery}>
          Nueva consulta
        </button>
      </div>
    </section>
  );
}
