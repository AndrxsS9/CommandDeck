import { FormEvent, useState, useEffect, useRef } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { listen } from '@tauri-apps/api/event';
import { generateCommand } from './services/commandService';
import type { CommandResult, CommandTool, PlatformContext } from './types/command';
import './styles.css';

import { AppHeader } from './components/AppHeader';
import { Sidebar } from './components/Sidebar';
import { ToolSelector } from './components/ToolSelector';
import { CommandInput, type CommandInputHandle } from './components/CommandInput';
import { CommandResultCard } from './components/CommandResultCard';
import { RecentCommands } from './components/RecentCommands';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

const suggestions = [
  'Mostrar el estado del repositorio Git',
  'Listar contenedores Docker activos',
  'Crear una carpeta llamada logs',
];

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState('home');
  const [activeTool, setActiveTool] = useState<CommandTool | 'all'>('all');
  
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
      const commandResult = await generateCommand(intent, activeTool);
      setResult(commandResult);
      if (commandResult.tool && commandResult.tool !== 'unknown') {
        setActiveTool(commandResult.tool);
      }
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
        <Sidebar activeItem={activeTab} onSelectItem={setActiveTab} />

        <main className="main-content">
          <div className="main-content__inner">
            <div className="workspace-header">
              <div>
                <h1 className="workspace-header__title">Asistente IA de Terminal</h1>
                <p className="workspace-header__subtitle">
                  Genera, analiza el riesgo e inspecciona comandos de infraestructura.
                </p>
              </div>
              <ToolSelector activeTool={activeTool} onSelectTool={setActiveTool} />
            </div>

            <CommandInput
              ref={commandInputRef}
              intent={intent}
              onIntentChange={setIntent}
              onSubmit={handleSubmit}
              loading={loading}
              suggestions={suggestions}
              onSuggestionClick={(s) => setIntent(s)}
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

        <RecentCommands onReuse={(cmd) => setIntent(cmd)} />
      </div>
    </div>
  );
}

export default App;
