import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllItems, putItem, deleteItem } from './db';

export function useStore<T extends { id: string }>(storeName: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const loadAll = useCallback(async () => {
    try {
      const all = await getAllItems<T>(storeName);
      setItems(all);
    } finally {
      setLoading(false);
    }
  }, [storeName]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showSaved = useCallback(() => {
    setSaveStatus('saved');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSaveStatus('idle'), 1500);
  }, []);

  const save = useCallback(async (item: T) => {
    setSaveStatus('saving');
    await putItem(storeName, item);
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) return [...prev.slice(0, idx), item, ...prev.slice(idx + 1)];
      return [...prev, item];
    });
    showSaved();
  }, [storeName, showSaved]);

  const remove = useCallback(async (id: string) => {
    setSaveStatus('saving');
    await deleteItem(storeName, id);
    setItems(prev => prev.filter(i => i.id !== id));
    showSaved();
  }, [storeName, showSaved]);

  return { items, setItems, loading, save, remove, reload: loadAll, saveStatus };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function uid(): string {
  return crypto.randomUUID();
}
