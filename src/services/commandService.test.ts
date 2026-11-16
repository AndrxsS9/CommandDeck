import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CommandSuggestion, RiskLevel } from '../types/command';
import { formatRiskReason, translations } from '../i18n/translations';

const llmMocks = vi.hoisted(() => ({
  generateLLMSuggestion: vi.fn(),
  getPlatformContext: vi.fn(),
}));

const historyMocks = vi.hoisted(() => ({ addHistoryEntry: vi.fn() }));

vi.mock('./llmCommandService', () => llmMocks);
vi.mock('./historyService', () => historyMocks);

import { generateCommand } from './commandService';

function suggestion(command: string, suggestedRisk: RiskLevel): CommandSuggestion {
  return {
    intent: 'intención original',
    command,
    tool: 'system',
    summary: {
      es: 'Resumen en español.',
      en: 'Summary in English.',
    },
    explanation: {
      es: ['part → descripción'],
      en: ['part → description'],
    },
    suggestedRisk,
  };
}

beforeEach(() => {
  llmMocks.generateLLMSuggestion.mockReset();
  llmMocks.getPlatformContext.mockReset();
  historyMocks.addHistoryEntry.mockReset();
  llmMocks.getPlatformContext.mockResolvedValue({ os: 'linux', shell: 'bash' });
});

describe('commandService — motivos de riesgo semánticos', () => {
  it('conserva read-only cuando el riesgo final es read', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git status', 'read'));
    const result = await generateCommand('estado', 'all', 'es');
    expect(result.risk).toBe('read');
    expect(result.riskReasons).toEqual([{ code: 'read-only' }]);
  });

  it('elimina read-only por código cuando la IA eleva el riesgo a medium', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git status', 'medium'));
    const result = await generateCommand('estado', 'all', 'es');
    expect(result.localRisk).toBe('read');
    expect(result.risk).toBe('medium');
    expect(result.riskReasons).toEqual([{ code: 'ai-higher-risk', level: 'medium' }]);
  });

  it('elimina read-only por código cuando la IA eleva el riesgo a critical', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('ls', 'critical'));
    const result = await generateCommand('listar', 'all', 'en');
    expect(result.risk).toBe('critical');
    expect(result.riskReasons.some((reason) => reason.code === 'read-only')).toBe(false);
    expect(result.riskReasons[0]).toEqual({ code: 'ai-higher-risk', level: 'critical' });
  });

  it('conserva read-only cuando la IA eleva solo a low', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git status', 'low'));
    const result = await generateCommand('estado', 'all', 'es');
    expect(result.risk).toBe('low');
    expect(result.riskReasons).toEqual([
      { code: 'ai-higher-risk', level: 'low' },
      { code: 'read-only' },
    ]);
  });

  it('la IA no puede reducir el riesgo local', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('rm -rf build', 'read'));
    const result = await generateCommand('borrar build', 'all', 'es');
    expect(result.risk).toBe('critical');
    expect(result.localRisk).toBe('critical');
    expect(result.riskReasons).toEqual([{ code: 'destructive-operation' }]);
  });

  it('nunca traduce ni altera el comando generado', async () => {
    const command = 'git log --pretty=format:"%h %s" -- ./src/carpeta';
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion(command, 'read'));
    const es = await generateCommand('historial', 'all', 'es');
    const en = await generateCommand('historial', 'all', 'en');
    expect(es.command).toBe(command);
    expect(en.command).toBe(command);
    // La intención es la petición original, no la devuelta por Gemini
    expect(es.intent).toBe('historial');
    expect(en.intent).toBe('historial');
  });

  it('el motivo aiHigher se presenta en el idioma seleccionado', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git status', 'medium'));
    const result = await generateCommand('estado', 'all', 'es');
    const [aiReason] = result.riskReasons;

    expect(formatRiskReason(aiReason, translations.es)).toBe(
      'La IA sugirió un nivel de riesgo superior (Medio) al detectado por el análisis local.'
    );
    expect(formatRiskReason(aiReason, translations.en)).toBe(
      'The AI suggested a higher risk level (Medium) than the one detected by local analysis.'
    );
  });
});

describe('commandService — idioma hacia Gemini', () => {
  it.each(['es', 'en'] as const)('pasa language="%s" al servicio LLM', async (language) => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git status', 'read'));
    await generateCommand('estado', 'all', language);
    expect(llmMocks.generateLLMSuggestion).toHaveBeenCalledWith(
      'estado',
      { os: 'linux', shell: 'bash' },
      'all',
      language
    );
  });
});

describe('commandService — textos de presentación bilingües', () => {
  it('el resultado contiene summary.es y summary.en', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git branch', 'read'));
    const result = await generateCommand('listar ramas', 'all', 'es');
    expect(result.summary).toEqual({ es: 'Resumen en español.', en: 'Summary in English.' });
  });

  it('el resultado contiene explanation.es y explanation.en como arrays', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git branch', 'read'));
    const result = await generateCommand('listar ramas', 'all', 'en');
    expect(Array.isArray(result.explanation.es)).toBe(true);
    expect(Array.isArray(result.explanation.en)).toBe(true);
    expect(result.explanation.es).toEqual(['part → descripción']);
    expect(result.explanation.en).toEqual(['part → description']);
  });

  it('los textos bilingües no dependen del idioma activo al generar', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git branch', 'read'));
    const es = await generateCommand('listar ramas', 'all', 'es');
    const en = await generateCommand('listar ramas', 'all', 'en');
    expect(es.summary).toEqual(en.summary);
    expect(es.explanation).toEqual(en.explanation);
    expect(es.command).toBe(en.command);
  });

  it('no usa una intención traducida por Gemini', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue({
      ...suggestion('kubectl get pods', 'read'),
      intent: 'List Kubernetes pods',
    });
    const result = await generateCommand('listar pods de kubernetes', 'all', 'en');
    expect(result.intent).toBe('listar pods de kubernetes');
  });

  it('el historial nuevo guarda ambas descripciones y la intención original', async () => {
    llmMocks.generateLLMSuggestion.mockResolvedValue(suggestion('git branch', 'read'));
    await generateCommand('listar ramas', 'all', 'en', 'user-1');
    expect(historyMocks.addHistoryEntry).toHaveBeenCalledWith(
      {
        intent: 'listar ramas',
        command: 'git branch',
        tool: 'system',
        desc: 'Summary in English.',
        descByLanguage: { es: 'Resumen en español.', en: 'Summary in English.' },
        risk: 'read',
      },
      'user-1'
    );
  });
});
