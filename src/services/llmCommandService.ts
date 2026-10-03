import { invoke } from '@tauri-apps/api/core';

import type {
  CommandSuggestion,
} from '../types/command';

/**
 * Comprueba si estamos dentro del runtime de Tauri.
 *
 * Cuando la app se abre en un navegador normal
 * (por ejemplo con "npm run dev"),
 * window.__TAURI_INTERNALS__ no existe
 * y invoke lanza un error críptico.
 */
function isTauriRuntime(): boolean {
  return typeof window !== 'undefined'
    && '__TAURI_INTERNALS__' in window;
}

export async function generateLLMSuggestion(
  intent: string
): Promise<CommandSuggestion> {

  const insideTauri = isTauriRuntime();
  console.log('¿ESTOY DENTRO DE TAURI?', insideTauri);

  if (!insideTauri) {
    throw new Error(
      'La app no está corriendo dentro de Tauri. '
      + 'Usa "npm run tauri dev" en vez de "npm run dev". '
      + 'invoke() solo funciona dentro de la ventana nativa de Tauri.'
    );
  }

  console.log('LLAMANDO A GEMINI (invoke generate_command_with_ai) con intent:', intent);

  try {
    const result = await invoke<CommandSuggestion>(
      'generate_command_with_ai',
      {
        intent,
      }
    );

    console.log('RESPUESTA DE GEMINI RECIBIDA:', result);

    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('ERROR INVOKE:', message);
    throw new Error(`Error al invocar Gemini desde Rust: ${message}`);
  }
}