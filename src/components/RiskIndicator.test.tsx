import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../i18n/LanguageContext';
import { LANGUAGE_KEY, formatRiskReason, translations, type Language } from '../i18n/translations';
import type { RiskReason, RiskReasonCode } from '../types/command';
import { RiskIndicator } from './RiskIndicator';

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

function render(language: Language, reasons: RiskReason[]) {
  storage[LANGUAGE_KEY] = language;
  return renderToStaticMarkup(
    <LanguageProvider>
      <RiskIndicator level="critical" reasons={reasons} />
    </LanguageProvider>
  );
}

const codes: RiskReasonCode[] = [
  'destructive-operation',
  'state-modification',
  'local-modification',
  'bulk-operation',
  'elevated-privileges',
  'read-only',
];

describe('formatRiskReason', () => {
  it('traduce todos los códigos al español', () => {
    expect(formatRiskReason({ code: 'destructive-operation' }, translations.es))
      .toBe('El comando puede eliminar, sobrescribir o descartar información.');
    expect(formatRiskReason({ code: 'read-only' }, translations.es))
      .toBe('El comando parece realizar únicamente una consulta o lectura.');
    for (const code of codes) {
      expect(formatRiskReason({ code }, translations.es)).toBe(translations.es.risk.reasons[code]);
    }
  });

  it('traduce todos los códigos al inglés', () => {
    expect(formatRiskReason({ code: 'destructive-operation' }, translations.en))
      .toBe('The command may delete, overwrite, or discard information.');
    expect(formatRiskReason({ code: 'elevated-privileges' }, translations.en))
      .toBe('The command requests elevated system privileges.');
    for (const code of codes) {
      expect(formatRiskReason({ code }, translations.en)).toBe(translations.en.risk.reasons[code]);
    }
  });

  it('cada código tiene un texto distinto en ES y EN', () => {
    for (const code of codes) {
      expect(translations.es.risk.reasons[code]).not.toBe('');
      expect(translations.en.risk.reasons[code]).not.toBe('');
      expect(translations.es.risk.reasons[code]).not.toBe(translations.en.risk.reasons[code]);
    }
  });

  it('aiHigher usa el idioma y la etiqueta de nivel seleccionados', () => {
    const reason: RiskReason = { code: 'ai-higher-risk', level: 'critical' };
    expect(formatRiskReason(reason, translations.es)).toBe(
      'La IA sugirió un nivel de riesgo superior (Crítico) al detectado por el análisis local.'
    );
    expect(formatRiskReason(reason, translations.en)).toBe(
      'The AI suggested a higher risk level (Critical) than the one detected by local analysis.'
    );
  });
});

describe('RiskIndicator', () => {
  it('muestra la razón en español cuando el idioma es ES', () => {
    const html = render('es', [{ code: 'destructive-operation' }]);
    expect(html).toContain('El comando puede eliminar, sobrescribir o descartar información.');
    expect(html).toContain('Nivel de Riesgo');
    expect(html).not.toContain('The command');
  });

  it('muestra la misma razón en inglés cuando el idioma es EN', () => {
    const html = render('en', [{ code: 'destructive-operation' }]);
    expect(html).toContain('The command may delete, overwrite, or discard information.');
    expect(html).toContain('Risk Level');
    expect(html).not.toContain('El comando');
  });

  it('muestra aiHigher en el idioma activo sin mezclar idiomas', () => {
    const reasons: RiskReason[] = [
      { code: 'ai-higher-risk', level: 'medium' },
      { code: 'local-modification' },
    ];
    const es = render('es', reasons);
    expect(es).toContain('La IA sugirió un nivel de riesgo superior (Medio)');
    expect(es).not.toContain('The AI');

    const en = render('en', reasons);
    expect(en).toContain('The AI suggested a higher risk level (Medium)');
    expect(en).not.toContain('La IA');
  });

  it('no muestra descripción si no hay razones', () => {
    const html = render('en', []);
    expect(html).not.toContain('risk-panel__description');
  });
});
