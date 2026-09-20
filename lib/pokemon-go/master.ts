// ============================================================
// Pokémon GO master data loader (static JSON)
// ============================================================

import type {
  GenerationProgress,
  PogoCostume,
  PogoDexEntry,
  PogoManifest,
  PogoTypeInfo,
} from '@/types/pokemon-go';
import { makeDexKey } from '@/types/pokemon-go';

let _entries: PogoDexEntry[] | null = null;
let _byKey: Map<string, PogoDexEntry> | null = null;
let _bySpecies: Map<number, PogoDexEntry[]> | null = null;
let _byFamily: Map<number, PogoDexEntry[]> | null = null;
let _costumes: PogoCostume[] | null = null;
let _types: PogoTypeInfo[] | null = null;
let _manifest: PogoManifest | null = null;

async function loadEntries(): Promise<PogoDexEntry[]> {
  if (_entries) return _entries;
  const data = await import('@/data/pokemon-go/collector-index.json');
  _entries = (data.default ?? data) as PogoDexEntry[];
  return _entries;
}

function indexEntries(entries: PogoDexEntry[]) {
  _byKey = new Map();
  _bySpecies = new Map();
  _byFamily = new Map();
  for (const e of entries) {
    _byKey.set(e.key, e);
    const speciesList = _bySpecies.get(e.speciesId) ?? [];
    speciesList.push(e);
    _bySpecies.set(e.speciesId, speciesList);
    const familyList = _byFamily.get(e.family) ?? [];
    familyList.push(e);
    _byFamily.set(e.family, familyList);
  }
}

export async function getCollectorIndex(): Promise<PogoDexEntry[]> {
  const entries = await loadEntries();
  if (!_byKey) indexEntries(entries);
  return entries;
}

export async function getDefaultEntries(): Promise<PogoDexEntry[]> {
  const entries = await getCollectorIndex();
  return entries.filter((e) => e.isDefault && !e.isCostume);
}

export async function getEntryByKey(key: string): Promise<PogoDexEntry | null> {
  await getCollectorIndex();
  return _byKey?.get(key) ?? null;
}

export async function getEntry(speciesId: number, formId: number): Promise<PogoDexEntry | null> {
  return getEntryByKey(makeDexKey(speciesId, formId));
}

export async function getEntriesBySpecies(speciesId: number): Promise<PogoDexEntry[]> {
  await getCollectorIndex();
  return _bySpecies?.get(speciesId) ?? [];
}

export async function getEntriesByFamily(familyId: number): Promise<PogoDexEntry[]> {
  await getCollectorIndex();
  return _byFamily?.get(familyId) ?? [];
}

export async function getAllFamilies(): Promise<Map<number, PogoDexEntry[]>> {
  await getCollectorIndex();
  return _byFamily ?? new Map();
}

export async function getCostumes(): Promise<PogoCostume[]> {
  if (_costumes) return _costumes;
  const data = await import('@/data/pokemon-go/costumes.json');
  _costumes = (data.default ?? data) as PogoCostume[];
  return _costumes;
}

export async function getTypes(): Promise<PogoTypeInfo[]> {
  if (_types) return _types;
  const data = await import('@/data/pokemon-go/types.json');
  _types = (data.default ?? data) as PogoTypeInfo[];
  return _types;
}

export async function getManifest(): Promise<PogoManifest | null> {
  if (_manifest) return _manifest;
  try {
    const data = await import('@/data/pokemon-go/manifest.json');
    _manifest = (data.default ?? data) as PogoManifest;
    return _manifest;
  } catch {
    return null;
  }
}

export async function getGenerationProgress(
  caughtKeys: Set<string>,
  options?: { defaultsOnly?: boolean }
): Promise<GenerationProgress[]> {
  const entries = await getCollectorIndex();
  const pool =
    options?.defaultsOnly === false
      ? entries.filter((e) => !e.isCostume)
      : entries.filter((e) => e.isDefault && !e.isCostume);

  const byGen = new Map<number, { name: string; total: number; caught: number }>();
  for (const e of pool) {
    const g = byGen.get(e.genId) ?? { name: e.generation, total: 0, caught: 0 };
    g.total += 1;
    if (caughtKeys.has(e.key)) g.caught += 1;
    byGen.set(e.genId, g);
  }

  return [...byGen.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([genId, g]) => ({
      genId,
      name: g.name,
      caught: g.caught,
      total: g.total,
      percent: g.total === 0 ? 0 : Math.round((g.caught / g.total) * 1000) / 10,
    }));
}

export { spriteUrl, formatDexNumber } from './format';
