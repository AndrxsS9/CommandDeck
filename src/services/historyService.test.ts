import { describe, it, expect, beforeEach } from 'vitest';
import {
  getHistory,
  addHistoryEntry,
  clearHistory,
  getHistoryKey,
} from './historyService';

// Mock localStorage and window in node environment
const storage: Record<string, string> = {};

const mockLocalStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    for (const key in storage) {
      delete storage[key];
    }
  },
};

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

if (typeof globalThis.window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      dispatchEvent: () => true,
    },
    writable: true,
  });
}

describe('historyService multi-user isolation', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('determines the storage key correctly based on userId', () => {
    expect(getHistoryKey()).toBe('commanddeck_history');
    expect(getHistoryKey('')).toBe('commanddeck_history');
    expect(getHistoryKey('user-123')).toBe('commanddeck_history_user-123');
    expect(getHistoryKey('550e8400-e29b-41d4-a716-446655440000')).toBe(
      'commanddeck_history_550e8400-e29b-41d4-a716-446655440000'
    );
  });

  it('isolates history between User A and User B', () => {
    const userA = 'user-a-uuid';
    const userB = 'user-b-uuid';

    // User A creates a Git command
    addHistoryEntry(
      {
        intent: 'listar ramas git',
        command: 'git branch',
        tool: 'git',
        desc: 'Lista ramas locales',
        risk: 'read',
      },
      userA
    );

    // Verify User A has 1 entry
    const historyA1 = getHistory(userA);
    expect(historyA1).toHaveLength(1);
    expect(historyA1[0].command).toBe('git branch');

    // Verify User B has empty history
    const historyB1 = getHistory(userB);
    expect(historyB1).toHaveLength(0);

    // User B creates a Docker command
    addHistoryEntry(
      {
        intent: 'listar contenedores docker',
        command: 'docker ps',
        tool: 'docker',
        desc: 'Lista contenedores activos',
        risk: 'read',
      },
      userB
    );

    // Verify User B has only their Docker command
    const historyB2 = getHistory(userB);
    expect(historyB2).toHaveLength(1);
    expect(historyB2[0].command).toBe('docker ps');

    // Verify User A still only has their Git command (no Docker)
    const historyA2 = getHistory(userA);
    expect(historyA2).toHaveLength(1);
    expect(historyA2[0].command).toBe('git branch');
  });

  it('does not touch or migrate the legacy global commanddeck_history', () => {
    // Setup legacy global history
    globalThis.localStorage.setItem(
      'commanddeck_history',
      JSON.stringify([
        {
          id: 'legacy-1',
          intent: 'comando previo',
          command: 'ls -la',
          tool: 'system',
          desc: 'listar archivos',
          risk: 'read',
          timestamp: 1000,
        },
      ])
    );

    const userA = 'user-a-new';
    // User A logs in and has no history
    expect(getHistory(userA)).toHaveLength(0);

    // User A adds an entry
    addHistoryEntry(
      {
        intent: 'nuevo comando',
        command: 'echo hola',
        tool: 'system',
        desc: 'saludo',
        risk: 'low',
      },
      userA
    );

    // Legacy history is untouched
    const legacyRaw = globalThis.localStorage.getItem('commanddeck_history');
    expect(legacyRaw).toContain('comando previo');
    expect(legacyRaw).not.toContain('nuevo comando');
  });

  it('clearing history for User A does not affect User B', () => {
    const userA = 'user-a-uuid';
    const userB = 'user-b-uuid';

    addHistoryEntry(
      { intent: 'A1', command: 'cmdA', tool: 'git', desc: 'descA', risk: 'low' },
      userA
    );
    addHistoryEntry(
      { intent: 'B1', command: 'cmdB', tool: 'docker', desc: 'descB', risk: 'low' },
      userB
    );

    clearHistory(userA);

    expect(getHistory(userA)).toHaveLength(0);
    expect(getHistory(userB)).toHaveLength(1);
  });
});
