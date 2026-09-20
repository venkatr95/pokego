// ============================================================
// IndexedDB persistence for Pokémon GO collection
// ============================================================

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PokemonGoCollection } from '@/types/pokemon-go';

const DB_NAME = 'pokeyou-pokemon-go';
const DB_VERSION = 1;
const STORE = 'collection';
const KEY = 'current';

interface PogoDb extends DBSchema {
  collection: {
    key: string;
    value: PokemonGoCollection;
  };
}

let dbPromise: Promise<IDBPDatabase<PogoDb>> | null = null;

function getDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'));
  }
  if (!dbPromise) {
    dbPromise = openDB<PogoDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadCollection(): Promise<PokemonGoCollection | null> {
  try {
    const db = await getDb();
    return (await db.get(STORE, KEY)) ?? null;
  } catch {
    return null;
  }
}

export async function saveCollection(collection: PokemonGoCollection): Promise<void> {
  const db = await getDb();
  const payload: PokemonGoCollection = {
    ...collection,
    updatedAt: new Date().toISOString(),
  };
  await db.put(STORE, payload, KEY);
}

export async function clearCollection(): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, KEY);
}

export function createEmptyCollection(): PokemonGoCollection {
  return {
    importedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pokemon: [],
  };
}
