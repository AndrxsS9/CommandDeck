import { describe, it, expect, vi, beforeAll } from 'vitest';

const tauriMocks = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@tauri-apps/api/core', () => tauriMocks);

import { generateLLMSuggestion } from './llmCommandService';

beforeAll(() => {
  // Simula el runtime de Tauri en el entorno node de pruebas
  Object.defineProperty(globalThis, 'window', {
    value: { __TAURI_INTERNALS__: {} },
    writable: true,
    configurable: true,
  });
});

describe('llmCommandService — idioma hacia el backend', () => {
  it.each(['es', 'en'] as const)('envía language="%s" a generate_command_with_ai', async (language) => {
    tauriMocks.invoke.mockResolvedValue({});
    await generateLLMSuggestion('listar ramas', { os: 'windows', shell: 'powershell' }, 'all', language);

    expect(tauriMocks.invoke).toHaveBeenLastCalledWith('generate_command_with_ai', {
      intent: 'listar ramas',
      platform: 'windows',
      shell: 'powershell',
      preferredTool: 'auto',
      language,
    });
  });

  it('devuelve summary y explanation bilingües tal como llegan del backend', async () => {
    const backendResponse = {
      intent: 'listar pods',
      command: 'kubectl get pods',
      tool: 'kubernetes',
      summary: {
        es: 'Lista todos los pods del namespace actual de Kubernetes.',
        en: 'Lists all pods in the current Kubernetes namespace.',
      },
      explanation: {
        es: ['kubectl → Herramienta de línea de comandos de Kubernetes.'],
        en: ['kubectl → The Kubernetes command-line tool.'],
      },
      suggestedRisk: 'read',
    };
    tauriMocks.invoke.mockResolvedValue(backendResponse);

    const result = await generateLLMSuggestion('listar pods', { os: 'linux', shell: 'bash' }, 'kubernetes', 'en');

    expect(result.summary.es).toBe(backendResponse.summary.es);
    expect(result.summary.en).toBe(backendResponse.summary.en);
    expect(result.explanation.es).toEqual(backendResponse.explanation.es);
    expect(result.explanation.en).toEqual(backendResponse.explanation.en);
    expect(result.command).toBe('kubectl get pods');
  });
});
