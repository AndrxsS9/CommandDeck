import { describe, it, expect, beforeEach } from 'vitest';
import { addHistoryEntry, clearHistory } from '../services/historyService';
import type { HistoryEntry } from '../services/historyService';
import { isHistoryUpdateForUser, subscribeToHistory, HISTORY_UPDATED_EVENT } from './useHistory';

// Entorno node: localStorage en memoria y window como EventTarget real
const storage: Record<string, string> = {};

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const key in storage) delete storage[key];
    },
  },
  writable: true,
  configurable: true,
});

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: new EventTarget(),
    writable: true,
    configurable: true,
  });
}

const entry = (intent: string, command: string): Omit<HistoryEntry, 'id' | 'timestamp'> => ({
  intent,
  command,
  tool: 'git',
  desc: `desc ${intent}`,
  risk: 'read',
});

describe('isHistoryUpdateForUser', () => {
  it('acepta eventos del mismo usuario y eventos globales', () => {
    expect(isHistoryUpdateForUser(new CustomEvent(HISTORY_UPDATED_EVENT, { detail: { userId: 'a' } }), 'a')).toBe(true);
    expect(isHistoryUpdateForUser(new CustomEvent(HISTORY_UPDATED_EVENT, { detail: { userId: undefined } }), 'a')).toBe(true);
    expect(isHistoryUpdateForUser(new CustomEvent(HISTORY_UPDATED_EVENT), 'a')).toBe(true);
  });

  it('ignora eventos de otro usuario', () => {
    expect(isHistoryUpdateForUser(new CustomEvent(HISTORY_UPDATED_EVENT, { detail: { userId: 'b' } }), 'a')).toBe(false);
  });
});

describe('subscribeToHistory (contador del header)', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('refleja altas y limpieza del historial del usuario', () => {
    const counts: number[] = [];
    const unsubscribe = subscribeToHistory('user-a', (entries) => counts.push(entries.length));

    addHistoryEntry(entry('listar ramas', 'git branch'), 'user-a');
    addHistoryEntry(entry('ver estado', 'git status'), 'user-a');
    clearHistory('user-a');

    expect(counts).toEqual([1, 2, 0]);
    unsubscribe();
  });

  it('no se actualiza con el historial de otro usuario', () => {
    const counts: number[] = [];
    const unsubscribe = subscribeToHistory('user-a', (entries) => counts.push(entries.length));

    addHistoryEntry(entry('listar contenedores', 'docker ps'), 'user-b');
    clearHistory('user-b');

    expect(counts).toEqual([]);
    unsubscribe();
  });

  it('entrega la lista del usuario correcto, con la intención original', () => {
    let latest: HistoryEntry[] = [];
    const unsubscribe = subscribeToHistory('user-a', (entries) => {
      latest = entries;
    });

    addHistoryEntry(entry('listar ramas', 'git branch'), 'user-a');

    expect(latest).toHaveLength(1);
    expect(latest[0].intent).toBe('listar ramas');
    expect(latest[0].command).toBe('git branch');
    unsubscribe();
  });

  it('deja de notificar tras cancelar la suscripción', () => {
    const counts: number[] = [];
    const unsubscribe = subscribeToHistory('user-a', (entries) => counts.push(entries.length));
    unsubscribe();

    addHistoryEntry(entry('listar ramas', 'git branch'), 'user-a');

    expect(counts).toEqual([]);
  });
});
