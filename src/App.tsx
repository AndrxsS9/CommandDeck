import { FormEvent, useMemo, useState } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { RiskBadge } from './components/RiskBadge';
import { generateCommand } from './services/mockCommandService';
import type { CommandResult } from './types/command';
import './styles.css';

const examples = [
  'Ver las ramas locales de Git',
  'Detener todos los contenedores Docker activos',
  'Listar los contenedores Docker',
];

function App() {
  const [intent, setIntent] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState('');

  const dangerous = useMemo(() => result?.risk === 'critical' || result?.risk === 'medium', [result]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!intent.trim()) return;
    setLoading(true);
    setStatus('');
    setExpanded(false);
    try {
      setResult(await generateCommand(intent));
    } finally {
      setLoading(false);
    }
  }

  async function copyCommand() {
    if (!result) return;
    try {
      await writeText(result.command);
      setStatus('Comando copiado al portapapeles.');
    } catch {
      await navigator.clipboard.writeText(result.command);
      setStatus('Comando copiado al portapapeles.');
    }
  }

  function requestExecution() {
    if (!result) return;
    setStatus(
      dangerous
        ? 'Ejecución bloqueada en el prototipo: primero implementaremos confirmación y executor seguro.'
        : 'Executor aún no conectado. Esta versión protege contra ejecución accidental.'
    );
  }

  return (
    <main className="shell">
      <section className="deck" aria-label="CommandDeck">
        <header className="brand-row">
          <div className="brand-mark">&gt;_</div>
          <div>
            <strong>CommandDeck</strong>
            <span>Intent → Command</span>
          </div>
          <kbd>Alt + Space</kbd>
        </header>

        <form className="intent-form" onSubmit={handleSubmit}>
          <span className="prompt">›</span>
          <input
            autoFocus
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe lo que quieres hacer…"
            aria-label="Describe tu intención"
          />
          <button type="submit" disabled={loading || !intent.trim()}>
            {loading ? 'Pensando…' : 'Generar'}
          </button>
        </form>

        {!result && !loading && (
          <div className="empty-state">
            <p>Escribe una intención en español. CommandDeck la convertirá en una instrucción revisable antes de cualquier acción.</p>
            <div className="chips">
              {examples.map((example) => (
                <button key={example} onClick={() => setIntent(example)}>{example}</button>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="loading-card">Analizando intención y construyendo comando…</div>}

        {result && !loading && (
          <article className={`result-card risk-frame-${result.risk}`}>
            <div className="result-meta">
              <span className="tool-pill">{result.tool.toUpperCase()}</span>
              <RiskBadge level={result.risk} />
            </div>

            <pre className="command"><code>{result.command}</code></pre>
            <p className="summary">{result.summary}</p>

            {result.riskReasons.length > 0 && (
              <div className="risk-note">
                <strong>{dangerous ? 'Revisa antes de continuar.' : 'Evaluación previa'}</strong>
                <span>{result.riskReasons.join(' ')}</span>
              </div>
            )}

            <button className="explain-toggle" onClick={() => setExpanded((value) => !value)}>
              {expanded ? 'Ocultar explicación' : '¿Cómo funciona?'}
            </button>

            {expanded && (
              <ol className="explanation">
                {result.explanation.map((item) => <li key={item}>{item}</li>)}
              </ol>
            )}

            <footer className="actions">
              <button className="secondary" onClick={() => { setResult(null); setStatus(''); }}>Nueva consulta</button>
              <div>
                <button className="secondary" onClick={copyCommand}>Copiar</button>
                <button className={dangerous ? 'danger' : 'primary'} onClick={requestExecution}>
                  {dangerous ? 'Revisar ejecución' : 'Ejecutar'}
                </button>
              </div>
            </footer>
          </article>
        )}

        {status && <div className="status" role="status">{status}</div>}
      </section>
    </main>
  );
}

export default App;
