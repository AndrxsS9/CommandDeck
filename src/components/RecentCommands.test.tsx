import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../i18n/LanguageContext';
import { translations, getInitialLanguage } from '../i18n/translations';
import type { HistoryEntry } from '../services/historyService';
import { RecentCommands } from './RecentCommands';
import { HistoryTrigger } from './HistoryTrigger';

const t = translations[getInitialLanguage()];
const noop = () => {};

const entries: HistoryEntry[] = [
  {
    id: '1',
    intent: 'listar ramas locales',
    command: 'git branch',
    tool: 'git',
    desc: 'Muestra las ramas locales',
    risk: 'read',
    timestamp: Date.now(),
  },
  {
    id: '2',
    intent: 'detener contenedor web',
    command: 'docker stop web',
    tool: 'docker',
    desc: 'Detiene el contenedor web',
    risk: 'medium',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
];

function renderDrawer(open: boolean, items: HistoryEntry[]) {
  return renderToStaticMarkup(
    <LanguageProvider>
      <RecentCommands open={open} onClose={noop} onReuse={noop} entries={items} userId="user-a" />
    </LanguageProvider>
  );
}

function renderTrigger(count: number, open = false) {
  return renderToStaticMarkup(
    <LanguageProvider>
      <HistoryTrigger count={count} open={open} onClick={noop} />
    </LanguageProvider>
  );
}

describe('RecentCommands (drawer de historial)', () => {
  it('cerrado: oculto, inerte y sin overlay activo', () => {
    const html = renderDrawer(false, entries);
    expect(html).not.toContain('history-drawer--open');
    expect(html).not.toContain('history-overlay--open');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('inert=""');
  });

  it('abierto: dialog accesible con overlay y botón de cierre', () => {
    const html = renderDrawer(true, entries);
    expect(html).toContain('history-drawer history-drawer--open');
    expect(html).toContain('history-overlay history-overlay--open');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).not.toContain('inert=""');
    expect(html).toContain(`aria-label="${t.history.close}"`);
  });

  it('muestra comando, herramienta, riesgo, descripción y acciones', () => {
    const html = renderDrawer(true, entries);
    expect(html).toContain('git branch');
    expect(html).toContain('docker stop web');
    expect(html).toContain('Muestra las ramas locales');
    expect(html).toContain(t.risk.labels.read);
    expect(html).toContain(t.risk.labels.medium);
    expect(html).toContain(`${entries.length} ${t.recent.saved}`);
    expect(html).toContain('id="clear-history"');
    // El botón Reutilizar se asocia a la intención original, no al comando
    expect(html).toContain(`aria-label="${t.recent.reuseAria} listar ramas locales"`);
    expect(html).toContain(`aria-label="${t.recent.reuseAria} detener contenedor web"`);
  });

  it('estado vacío: muestra el texto existente y oculta Limpiar', () => {
    const html = renderDrawer(true, []);
    expect(html).toContain(t.history.empty);
    expect(html).toContain(`0 ${t.recent.saved}`);
    expect(html).not.toContain('id="clear-history"');
  });
});

describe('HistoryTrigger (botón del header)', () => {
  it('muestra el contador cuando hay registros', () => {
    const html = renderTrigger(12);
    expect(html).toContain('history-trigger__count');
    expect(html).toContain('>12<');
    expect(html).toContain(`aria-label="${t.header.history} (12 ${t.recent.saved})"`);
    expect(html).toContain('aria-controls="history-drawer"');
  });

  it('oculta el contador sin registros y limita a 99+', () => {
    expect(renderTrigger(0)).not.toContain('history-trigger__count');
    expect(renderTrigger(150)).toContain('>99+<');
  });

  it('refleja el estado abierto con aria-expanded', () => {
    expect(renderTrigger(3, false)).toContain('aria-expanded="false"');
    expect(renderTrigger(3, true)).toContain('aria-expanded="true"');
  });
});
