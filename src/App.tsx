import { FormEvent, useMemo, useState, useEffect } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { generateCommand } from './services/commandService';
import type { CommandResult, CommandTool } from './types/command';
import './styles.css';

import { AppHeader } from './components/AppHeader';
import { Sidebar } from './components/Sidebar';
import { ToolSelector } from './components/ToolSelector';
import { CommandInput } from './components/CommandInput';
import { CommandResultCard } from './components/CommandResultCard';
import { RecentCommands } from './components/RecentCommands';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

const suggestions = [
  'Ver las ramas locales de Git',
  'Detener todos los contenedores Docker',
  'Listar pods en Kubernetes',
];

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState('home');
  const [activeTool, setActiveTool] = useState<CommandTool | 'all'>('git');
  
  const [intent, setIntent] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);

  // Efecto para cambiar el tema en el DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Limpiar el estado copiado después de unos segundos
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!intent.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    setStatus('');
    setResult(null);
    setCopied(false);
    
    try {
      const commandResult = await generateCommand(intent);
      setResult(commandResult);
      if (commandResult.tool && commandResult.tool !== 'unknown') {
        setActiveTool(commandResult.tool);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('ERROR GEMINI:', message);
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
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
              intent={intent}
              onIntentChange={setIntent}
              onSubmit={handleSubmit}
              loading={loading}
              suggestions={suggestions}
              onSuggestionClick={(s) => setIntent(s)}
            />

            {loading && <LoadingState />}
            
            {errorMsg && (
              <ErrorState message={errorMsg} onRetry={() => handleSubmit({ preventDefault: () => {} } as FormEvent)} />
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
                  Escribe una intención en español. CommandDeck la convertirá en un comando
                  seguro y te mostrará un desglose antes de ejecutarlo.
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
