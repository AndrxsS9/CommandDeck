import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../i18n/LanguageContext';
import { LANGUAGE_KEY, translations, type Language } from '../i18n/translations';
import type { CommandResult } from '../types/command';
import { CommandResultCard } from './CommandResultCard';

const storage: Record<string, string> = {};

beforeAll(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    },
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  for (const key in storage) delete storage[key];
});

const noop = () => {};

/** Resultado generado UNA sola vez; el idioma solo cambia la presentación. */
const result: CommandResult = {
  id: 'r1',
  intent: 'listar pods de kubernetes',
  command: 'kubectl get pods -n "mi namespace"',
  tool: 'kubernetes',
  summary: {
    es: 'Lista todos los pods del namespace indicado.',
    en: 'Lists all pods in the given namespace.',
  },
  explanation: {
    es: ['kubectl → Herramienta de línea de comandos de Kubernetes.', 'get → Subcomando para obtener recursos.'],
    en: ['kubectl → The Kubernetes command-line tool.', 'get → Subcommand used to retrieve resources.'],
  },
  aiRisk: 'read',
  localRisk: 'read',
  risk: 'read',
  riskReasons: [{ code: 'read-only' }],
  reversible: true,
  destructive: false,
  requiresConfirmation: false,
};

function render(language: Language, value: CommandResult = result) {
  storage[LANGUAGE_KEY] = language;
  return renderToStaticMarkup(
    <LanguageProvider>
      <CommandResultCard result={value} onCopy={noop} onNewQuery={noop} copied={false} />
    </LanguageProvider>
  );
}

function commandText(html: string): string | undefined {
  return html.match(/<span class="command-box__text">([^<]*)<\/span>/)?.[1];
}

describe('CommandResultCard — textos de presentación según idioma', () => {
  it('ES: muestra summary y desglose en español', () => {
    const html = render('es');
    expect(html).toContain('Lista todos los pods del namespace indicado.');
    expect(html).toContain('Herramienta de línea de comandos de Kubernetes.');
    expect(html).toContain('Subcomando para obtener recursos.');
    expect(html).not.toContain('Lists all pods in the given namespace.');
    expect(html).not.toContain('The Kubernetes command-line tool.');
    expect(html).toContain(translations.es.risk.reasons['read-only']);
  });

  it('EN: muestra summary y desglose en inglés', () => {
    const html = render('en');
    expect(html).toContain('Lists all pods in the given namespace.');
    expect(html).toContain('The Kubernetes command-line tool.');
    expect(html).toContain('Subcommand used to retrieve resources.');
    expect(html).not.toContain('Lista todos los pods del namespace indicado.');
    expect(html).not.toContain('Herramienta de línea de comandos de Kubernetes.');
    expect(html).toContain(translations.en.risk.reasons['read-only']);
  });

  it('los tokens del comando no se traducen en el desglose', () => {
    for (const language of ['es', 'en'] as const) {
      const html = render(language);
      expect(html).toContain('<code class="params-breakdown__code">kubectl</code>');
      expect(html).toContain('<code class="params-breakdown__code">get</code>');
    }
  });

  it('el comando es exactamente el mismo en ES y EN', () => {
    const es = commandText(render('es'));
    const en = commandText(render('en'));
    expect(es).toBeDefined();
    expect(es).toBe(en);
    expect(es).toBe(renderToStaticMarkup(<>{result.command}</>));
  });

  it('cambiar de idioma no muta el resultado (sin regenerar ni nueva llamada)', () => {
    const snapshot = structuredClone(result);
    render('es');
    render('en');
    render('es');
    expect(result).toEqual(snapshot);
    expect(result.intent).toBe('listar pods de kubernetes');
  });
});
