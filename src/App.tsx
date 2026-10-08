import { FormEvent, useState, useEffect, useRef } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { listen } from '@tauri-apps/api/event';
import { generateCommand } from './services/commandService';
import type { CommandResult, PlatformContext } from './types/command';
import './styles.css';

import { AppHeader } from './components/AppHeader';
import { CommandInput, type CommandInputHandle } from './components/CommandInput';
import { CommandResultCard } from './components/CommandResultCard';
import { RecentCommands } from './components/RecentCommands';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { useI18n } from './i18n/LanguageContext';
import { ToolIcon } from './components/ToolIcon';

type Theme = 'dark' | 'light';

const THEME_KEY = 'commanddeck_theme';

/** Modo claro por defecto; respeta la preferencia guardada si existe. */
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage no disponible: usar valor por defecto
  }
  return 'light';
}

function App() {
  const { t, language } = useI18n();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [intent, setIntent] = useState('');
  const [result, setResult] = useState<(CommandResult & { platformContext: PlatformContext }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState<keyof typeof t.status | null>(null);
  const [copied, setCopied] = useState(false);

  const commandInputRef = useRef<CommandInputHandle>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Si no se puede persistir, el tema sigue funcionando en la sesión actual
    }
  }, [theme]);

  // Escuchar evento de foco desde el HotKey de Tauri
  useEffect(() => {
    const unlisten = listen('focus-input', () => {
      commandInputRef.current?.focus();
    });
    
    return () => {
      unlisten.then(f => f());
    };
  }, []);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  async function generateCurrentIntent() {
    if (!intent.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    setStatus(null);
    setResult(null);
    setCopied(false);
    
    try {
      // La herramienta se infiere siempre automáticamente desde la intención
      const commandResult = await generateCommand(intent, 'all', language);
      setResult(commandResult);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Error al generar comando:', message);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await generateCurrentIntent();
  }

  async function copyCommand() {
    if (!result) return;
    try {
      await writeText(result.command);
      setCopied(true);
      setStatus('copied');
    } catch {
      await navigator.clipboard.writeText(result.command);
      setCopied(true);
      setStatus('copied');
    }
  }

  return (
    <div className="app-layout">
      <AppHeader 
        theme={theme} 
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
      />

      <div className="app-body">
        <main className="main-content">
          <div className="main-content__inner">
            <div className="hero-bg"></div>
            <div className="workspace-header">
              <h1 className="workspace-header__title">{t.workspace.title}</h1>
              <p className="workspace-header__subtitle">
                {t.workspace.subtitle}
              </p>
              <div className="workspace-header__compat">
                <span>{t.workspace.compat}</span>
                <div className="compat-badges">
                  <div className="compat-badge"><ToolIcon name="git" /> Git</div>
                  <div className="compat-badge"><ToolIcon name="docker" /> Docker</div>
                  <div className="compat-badge"><ToolIcon name="kubernetes" /> Kubernetes</div>
                  <div className="compat-badge"><ToolIcon name="system" /> {t.tools.system}</div>
                </div>
              </div>
            </div>

            <CommandInput
              ref={commandInputRef}
              intent={intent}
              onIntentChange={setIntent}
              onSubmit={handleSubmit}
              loading={loading}
              suggestions={t.suggestions}
              onSuggestionClick={setIntent}
            />

            {loading && <LoadingState />}
            
            {errorMsg && (
              <ErrorState message={errorMsg} onRetry={generateCurrentIntent} />
            )}

            {result && !loading && !errorMsg && (
              <CommandResultCard 
                result={result}
                onCopy={copyCommand}
                onNewQuery={() => {
                  setResult(null);
                  setIntent('');
                }}
                copied={copied}
              />
            )}

            {!result && !loading && !errorMsg && (
              <div className="empty-state">
                <p className="empty-state__text">
                  {t.emptyState}
                </p>
              </div>
            )}
            
            {status && (
              <div className="status-bar">{t.status[status]}</div>
            )}
          </div>
        </main>

        <RecentCommands onReuse={setIntent} />
      </div>
    </div>
  );
}

export default App;
