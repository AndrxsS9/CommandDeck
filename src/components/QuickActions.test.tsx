import { describe, it, expect } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../i18n/LanguageContext';
import { translations, getInitialLanguage } from '../i18n/translations';
import { QuickActions } from './QuickActions';
import { SystemContext } from './SystemContext';

const KEYS = ['git', 'docker', 'kubernetes'] as const;

// Idioma activo en el entorno de test (español por defecto)
const t = translations[getInitialLanguage()];

function render(node: ReactNode) {
  return renderToStaticMarkup(<LanguageProvider>{node}</LanguageProvider>);
}

describe('Acciones rápidas', () => {
  it('renderiza título, subtítulo y tres tarjetas con botón "Usar"', () => {
    const html = render(<QuickActions onUse={() => {}} />);

    expect(html).toContain(t.quickActions.title);
    expect(html).toContain(t.quickActions.subtitle);
    for (const key of KEYS) {
      expect(html).toContain(t.quickActions.items[key].subtitle);
    }
    expect(html.match(/class="quick-action-card__btn"/g)).toHaveLength(3);
    // Los botones nunca envían el formulario del traductor
    expect(html).not.toContain('type="submit"');
  });

  it('las plantillas existen en ES y EN y son intenciones de texto (no comandos)', () => {
    for (const lang of ['es', 'en'] as const) {
      const qa = translations[lang].quickActions;
      expect(qa.title).toBeTruthy();
      expect(qa.use).toBeTruthy();
      for (const key of KEYS) {
        expect(qa.items[key].intent.trim().length).toBeGreaterThan(0);
        expect(qa.items[key].intent).not.toMatch(/^(git|docker|kubectl)\s/);
      }
    }
    expect(translations.en.quickActions.title).not.toBe(translations.es.quickActions.title);
    expect(translations.en.notice).not.toBe(translations.es.notice);
  });
});

describe('Contexto del sistema', () => {
  it('muestra los cuatro indicadores', () => {
    const html = render(<SystemContext />);

    expect(html).toContain('Windows');
    expect(html).toContain('PowerShell');
    expect(html).toContain(t.context.geminiReady);
    expect(html).toContain(t.context.autoMode);
    expect(html.match(/class="context-chip"/g)).toHaveLength(4);
  });
});
