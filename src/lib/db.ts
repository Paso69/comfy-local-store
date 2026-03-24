import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'life-os-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const STORE_NAMES = [
  'goals', 'tasks', 'habits', 'habitLogs', 'routines', 'routineTemplates',
  'scheduleItems', 'notes', 'knowledgeItems', 'ideas', 'trades',
  'financialRoadmap', 'weeklyReviews', 'phoneRules', 'phoneLogs',
  'domains', 'taskLists', 'reviewTemplates', 'dashboardWidgets', 'appSettings'
] as const;

export type StoreName = typeof STORE_NAMES[number];

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        STORE_NAMES.forEach(name => {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, { keyPath: 'id' });
          }
        });
      }
    });
  }
  return dbPromise;
}

export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return db.getAll(storeName);
}

export async function getItem<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await getDB();
  return db.get(storeName, id);
}

export async function putItem<T>(storeName: string, item: T): Promise<void> {
  const db = await getDB();
  await db.put(storeName, item);
}

export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await getDB();
  await db.delete(storeName, id);
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();
  await db.clear(storeName);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const names = Array.from(db.objectStoreNames);
  const tx = db.transaction(names, 'readwrite');
  await Promise.all(names.map(n => tx.objectStore(n).clear()));
  await tx.done;
}

export async function exportAllData(): Promise<Record<string, unknown[]>> {
  const db = await getDB();
  const names = Array.from(db.objectStoreNames);
  const data: Record<string, unknown[]> = {};
  for (const name of names) {
    data[name] = await db.getAll(name);
  }
  return data;
}

export async function importAllData(data: Record<string, unknown[]>): Promise<void> {
  const db = await getDB();
  for (const [storeName, items] of Object.entries(data)) {
    if (db.objectStoreNames.contains(storeName)) {
      const tx = db.transaction(storeName, 'readwrite');
      await tx.objectStore(storeName).clear();
      for (const item of items) {
        await tx.objectStore(storeName).put(item);
      }
      await tx.done;
    }
  }
}
