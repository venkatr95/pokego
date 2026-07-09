// ============================================================
// Pokémon Data Utilities
// ============================================================

import type { Pokemon, PokemonSearchResult, PokemonTypeName } from '@/types/pokemon';

// Dynamic import of local JSON (server-side safe)
let _cache: Pokemon[] | null = null;

export async function getAllPokemon(): Promise<Pokemon[]> {
  if (_cache) return _cache;
  try {
    const data = await import('@/data/pokemon.json');
    _cache = data.default as Pokemon[];
    return _cache;
  } catch {
    return [];
  }
}

export async function getPokemonById(id: number): Promise<Pokemon | null> {
  const all = await getAllPokemon();
  return all.find((p) => p.id === id) ?? null;
}

export async function getPokemonByName(name: string): Promise<Pokemon | null> {
  const all = await getAllPokemon();
  const lower = name.toLowerCase();
  return all.find((p) => p.name.toLowerCase() === lower) ?? null;
}

export async function searchPokemon(query: string, limit = 20): Promise<PokemonSearchResult[]> {
  const all = await getAllPokemon();
  const lower = query.toLowerCase().trim();
  if (!lower) return all.slice(0, limit).map(toSearchResult);

  const byId = parseInt(lower, 10);

  const results = all.filter((p) => {
    if (!isNaN(byId) && p.id === byId) return true;
    if (p.name.toLowerCase().includes(lower)) return true;
    if (p.displayName.toLowerCase().includes(lower)) return true;
    return false;
  });

  // Exact matches first
  results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === lower ? -1 : 0;
    const bExact = b.name.toLowerCase() === lower ? -1 : 0;
    return aExact - bExact || a.id - b.id;
  });

  return results.slice(0, limit).map(toSearchResult);
}

export async function getPokemonByType(type: PokemonTypeName): Promise<Pokemon[]> {
  const all = await getAllPokemon();
  return all.filter((p) => p.types.includes(type));
}

function toSearchResult(p: Pokemon): PokemonSearchResult {
  return {
    id: p.id,
    name: p.name,
    displayName: p.displayName,
    types: p.types,
    primaryType: p.primaryType,
    sprite: p.sprites.official_artwork ?? p.sprites.front_default,
  };
}

/** Format Pokémon height from decimetres to human-readable */
export function formatHeight(decimetres: number): string {
  const meters = decimetres / 10;
  const feet = Math.floor(meters * 3.281);
  const inches = Math.round((meters * 3.281 - feet) * 12);
  return `${meters.toFixed(1)}m (${feet}'${inches}")`;
}

/** Format Pokémon weight from hectograms to human-readable */
export function formatWeight(hectograms: number): string {
  const kg = hectograms / 10;
  const lbs = (kg * 2.205).toFixed(1);
  return `${kg.toFixed(1)}kg (${lbs} lbs)`;
}

/** Format national dex number with leading zeros */
export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

/** Get stat color based on value */
export function getStatColor(value: number): string {
  if (value >= 150) return '#ff6b6b';
  if (value >= 110) return '#ffd700';
  if (value >= 80)  return '#51cf66';
  if (value >= 50)  return '#74c0fc';
  return '#adb5bd';
}

/** Get stat percentage for bar display (max 255) */
export function getStatPercent(value: number): number {
  return Math.min(100, Math.round((value / 255) * 100));
}

/** Capitalize and format Pokémon name */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

/** Get generation label */
export function getGenerationLabel(gen: number): string {
  const labels: Record<number, string> = {
    1: 'Generation I — Kanto',
    2: 'Generation II — Johto',
    3: 'Generation III — Hoenn',
    4: 'Generation IV — Sinnoh',
    5: 'Generation V — Unova',
    6: 'Generation VI — Kalos',
    7: 'Generation VII — Alola',
    8: 'Generation VIII — Galar',
    9: 'Generation IX — Paldea',
  };
  return labels[gen] ?? `Generation ${gen}`;
}
