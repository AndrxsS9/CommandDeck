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

const GLOBAL_HISTORY_KEY = 'commanddeck_history';
const USER_HISTORY_PREFIX = 'commanddeck_history_';
const MAX_HISTORY = 1000;

/** Obtiene la clave en localStorage según el userId */
export function getHistoryKey(userId?: string): string {
  if (userId && userId.trim()) {
    return `${USER_HISTORY_PREFIX}${userId.trim()}`;
  }
  return GLOBAL_HISTORY_KEY;
}

export function getHistory(userId?: string): HistoryEntry[] {
  try {
    const key = getHistoryKey(userId);
    const raw = localStorage.getItem(key);
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

export function addHistoryEntry(
  entry: Omit<HistoryEntry, 'id' | 'timestamp'>,
  userId?: string
): void {
  try {
    const key = getHistoryKey(userId);
    const current = getHistory(userId);
    
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
    localStorage.setItem(key, JSON.stringify(updated));
    
    // Despachar evento con detalle del userId para oyentes específicos
    window.dispatchEvent(new CustomEvent('history_updated', { detail: { userId } }));
  } catch (e) {
    console.warn('[CommandDeck] No se pudo guardar en el historial:', e);
  }
}

export function clearHistory(userId?: string): void {
  try {
    const key = getHistoryKey(userId);
    localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('history_updated', { detail: { userId } }));
  } catch (e) {
    console.warn('[CommandDeck] No se pudo limpiar el historial:', e);
  }
}
