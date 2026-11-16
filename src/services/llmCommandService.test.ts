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
});
