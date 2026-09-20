import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PokemonGoCollection } from '@pokeyou/pokemon-go-core';

const KEY = 'pokeyou-go-collection';

export async function loadCollection(): Promise<PokemonGoCollection | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  return JSON.parse(raw) as PokemonGoCollection;
}

export async function saveCollection(collection: PokemonGoCollection): Promise<void> {
  const payload: PokemonGoCollection = {
    ...collection,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function clearCollection(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export function createEmptyCollection(): PokemonGoCollection {
  return {
    importedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pokemon: [],
  };
}
