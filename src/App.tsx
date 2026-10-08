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

const suggestions = [
  'Mostrar las ramas locales de Git',
  'Listar contenedores Docker activos',
  'Listar los pods de Kubernetes',
  'Crear una carpeta llamada logs'
];

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [intent, setIntent] = useState('');
  const [result, setResult] = useState<(CommandResult & { platformContext: PlatformContext }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const commandInputRef = useRef<CommandInputHandle>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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
    setStatus('');
    setResult(null);
    setCopied(false);
    
    try {
      // La herramienta se infiere siempre automáticamente desde la intención
      const commandResult = await generateCommand(intent, 'all');
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
      setStatus('Comando copiado al portapapeles.');
    } catch {
      await navigator.clipboard.writeText(result.command);
      setCopied(true);
      setStatus('Comando copiado al portapapeles.');
    }
  }

  return (
    <div className="app-layout">
      <AppHeader 
        theme={theme} 
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} 
      />

      <div className="app-body">
        <main className="main-content">
          <div className="main-content__inner">
            <div className="workspace-header">
              <h1 className="workspace-header__title">Asistente IA de Terminal</h1>
              <p className="workspace-header__subtitle">
                Genera, analiza el riesgo e inspecciona comandos de infraestructura.
              </p>
              <p className="workspace-header__compat">
                Compatible con Git, Docker, Kubernetes y comandos del sistema.
              </p>
            </div>

            <CommandInput
              ref={commandInputRef}
              intent={intent}
              onIntentChange={setIntent}
              onSubmit={handleSubmit}
              loading={loading}
              suggestions={suggestions}
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
                  Escribe una intención en español. CommandDeck la convertirá en una propuesta de comando y evaluará su nivel de riesgo antes de cualquier acción.
                </p>
              </div>
            )}
            
            {status && (
              <div className="status-bar">{status}</div>
            )}
          </div>
        </main>

        <RecentCommands onReuse={setIntent} />
      </div>
    </div>
  );
}

export default App;
