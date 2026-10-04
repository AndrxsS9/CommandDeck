import type { CommandTool, RiskLevel } from '../types/command';

export interface HistoryEntry {
  id: string;
  intent: string;
  command: string;
  tool: CommandTool;
  desc: string;
  risk: RiskLevel;
  timestamp: number;
}

const HISTORY_KEY = 'commanddeck_history';
const MAX_HISTORY = 20;

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse history', e);
  }
  return [];
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  const current = getHistory();
  
  // Evitar duplicados consecutivos basados en intent
  if (current.length > 0 && current[0].intent === entry.intent) {
    return;
  }

  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now()
  };

  const updated = [newEntry, ...current].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  
  // Disparar evento para que UI actualice
  window.dispatchEvent(new Event('history_updated'));
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event('history_updated'));
}
