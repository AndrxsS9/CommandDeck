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
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => 
          item && 
          item.id && 
          item.intent && 
          item.command && 
          item.tool && 
          item.risk && 
          item.timestamp
        ).slice(0, MAX_HISTORY);
      }
    }
  } catch (e) {
    console.warn('[CommandDeck] No se pudo leer el historial:', e);
  }
  return [];
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  try {
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
    
    window.dispatchEvent(new Event('history_updated'));
  } catch (e) {
    console.warn('[CommandDeck] No se pudo guardar en el historial:', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new Event('history_updated'));
  } catch (e) {
    console.warn('[CommandDeck] No se pudo limpiar el historial:', e);
  }
}
