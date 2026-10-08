import type { CommandResult, PlatformContext } from '../types/command';
import type { Translations } from '../i18n/translations';
import { useI18n } from '../i18n/LanguageContext';
import { CommandExplanation } from './CommandExplanation';
import { RiskIndicator } from './RiskIndicator';
import { ToolIcon } from './ToolIcon';

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

function getPlatformLabel(t: Translations, ctx?: PlatformContext): string {
  if (!ctx) return t.result.platformUnknown;

  const { os, shell } = ctx;
  const osLabel = OS_LABELS[os];
  const shellLabel = SHELL_LABELS[shell];

  if (!osLabel && !shellLabel) return t.result.platformUnknown;
  if (!osLabel) return `${t.result.shellInferred} ${shellLabel}`;
  if (!shellLabel) return `${osLabel} / ${t.result.shellUnknown}`;
  return `${osLabel} / ${shellLabel}`;
}

export function CommandResultCard({ result, onCopy, onNewQuery, copied }: CommandResultCardProps) {
  const { t } = useI18n();

  return (
    <section className="command-result">
      {/* Header */}
      <div className="command-result__header">
        <div className="command-result__header-left">
          <span className="command-result__label">{t.result.label}</span>
          <div className="command-result__tool-detected">
            <ToolIcon name={result.tool as any} />
            <span>{t.tools[result.tool] || t.tools.unknown} · {t.result.detectedAuto}</span>
          </div>
        </div>
        <span className="command-result__shell-tag">{getPlatformLabel(t, result.platformContext)}</span>
      </div>

      {/* Terminal box */}
      <div className="command-box">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <span className="command-box__prompt">$</span>
          <span className="command-box__text">{result.command}</span>
        </div>
        <div className="command-box__actions">
          <button id="copy-command" className="btn-secondary" onClick={onCopy}>
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            <span>{copied ? t.result.copied : t.result.copy}</span>
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
        <button id="new-query" className="btn-new-query" onClick={onNewQuery}>
          {t.result.newQuery}
        </button>
      </div>
    </section>
  );
}
