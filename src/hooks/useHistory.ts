import { useEffect, useState } from 'react';
import { getHistory, type HistoryEntry } from '../services/historyService';

/** Evento que historyService despacha al agregar o limpiar registros. */
export const HISTORY_UPDATED_EVENT = 'history_updated';

/**
 * Indica si un evento `history_updated` afecta al usuario indicado.
 * Un evento sin userId en el detalle se considera global y aplica a todos.
 */
export function isHistoryUpdateForUser(event: Event, userId?: string): boolean {
  const detail = (event as CustomEvent<{ userId?: string } | null>).detail;
  return !(detail && detail.userId !== undefined && detail.userId !== userId);
}

/**
 * Se suscribe a los cambios del historial del usuario y entrega la lista
 * actualizada en cada cambio. Devuelve la función para cancelar la suscripción.
 */
export function subscribeToHistory(
  userId: string | undefined,
  onChange: (entries: HistoryEntry[]) => void
): () => void {
  const handler = (event: Event) => {
    if (isHistoryUpdateForUser(event, userId)) {
      onChange(getHistory(userId));
    }
  };
  window.addEventListener(HISTORY_UPDATED_EVENT, handler);
  return () => window.removeEventListener(HISTORY_UPDATED_EVENT, handler);
}

/** Historial del usuario, sincronizado con historyService. */
export function useHistory(userId?: string): HistoryEntry[] {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistory(userId));

  useEffect(() => {
    setEntries(getHistory(userId));
    return subscribeToHistory(userId, setEntries);
  }, [userId]);

  return entries;
}
