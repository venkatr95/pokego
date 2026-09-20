// ============================================================
// Collector engine — merge master data × user collection
// ============================================================

import type {
  AggregatedDexRow,
  CollectionStatus,
  DexFilter,
  PogoDexEntry,
  PokemonGoCollection,
  PokemonGoInstance,
  PokedexStatus,
} from '@/types/pokemon-go';
import { EMPTY_COLLECTION_STATUS, makeDexKey } from '@/types/pokemon-go';
import { resolveHundo } from './hundo';

export interface InstanceIndex {
  byKey: Map<string, PokemonGoInstance[]>;
  bySpecies: Map<number, PokemonGoInstance[]>;
  /** Max candy observed, keyed by speciesId (callers may also key by familyId). */
  candyBySpecies: Map<number, number>;
}

export function indexCollection(collection: PokemonGoCollection | null): InstanceIndex {
  const byKey = new Map<string, PokemonGoInstance[]>();
  const bySpecies = new Map<number, PokemonGoInstance[]>();
  const candyBySpecies = new Map<number, number>();

  if (!collection) return { byKey, bySpecies, candyBySpecies };

  for (const inst of collection.pokemon) {
    const formId = inst.formId ?? 0;
    const key = makeDexKey(inst.speciesId, formId);
    const list = byKey.get(key) ?? [];
    list.push(inst);
    byKey.set(key, list);

    const speciesList = bySpecies.get(inst.speciesId) ?? [];
    speciesList.push(inst);
    bySpecies.set(inst.speciesId, speciesList);

    if (inst.candy != null) {
      const prev = candyBySpecies.get(inst.speciesId) ?? 0;
      if (inst.candy > prev) candyBySpecies.set(inst.speciesId, inst.candy);
    }
  }

  return { byKey, bySpecies, candyBySpecies };
}

export function aggregateFlags(instances: PokemonGoInstance[]): CollectionStatus {
  if (instances.length === 0) return { ...EMPTY_COLLECTION_STATUS };

  const flags: CollectionStatus = { ...EMPTY_COLLECTION_STATUS };
  for (const inst of instances) {
    if (inst.caught) flags.caught = true;
    if (inst.shiny) flags.shiny = true;
    if (inst.shadow) flags.shadow = true;
    if (inst.purified) flags.purified = true;
    if (inst.lucky) flags.lucky = true;
    if (resolveHundo(inst)) flags.hundo = true;
    if (inst.gender === 'male') flags.male = true;
    if (inst.gender === 'female') flags.female = true;
    if (inst.mega) flags.mega = true;
    if (inst.primal) flags.primal = true;
    if (inst.dynamax) flags.dynamax = true;
    if (inst.gigantamax) flags.gigantamax = true;
    if (inst.costumeId != null && inst.costumeId > 0) flags.costume = true;
  }
  return flags;
}

export function resolveStatus(instances: PokemonGoInstance[]): PokedexStatus {
  if (instances.some((i) => i.caught)) return 'caught';
  if (instances.some((i) => i.seen)) return 'seen';
  return 'not_seen';
}

function instancesForEntry(
  entry: PogoDexEntry,
  index: InstanceIndex
): PokemonGoInstance[] {
  const exact = index.byKey.get(entry.key) ?? [];
  if (exact.length > 0) return exact;

  // Fallback: species-level records with formId 0 / undefined apply to default form
  if (entry.isDefault) {
    const species = index.bySpecies.get(entry.speciesId) ?? [];
    return species.filter((i) => i.formId == null || i.formId === 0 || i.formId === entry.formId);
  }
  return [];
}

export function buildAggregatedRows(
  entries: PogoDexEntry[],
  collection: PokemonGoCollection | null,
  options?: { defaultsOnly?: boolean }
): AggregatedDexRow[] {
  const index = indexCollection(collection);
  const pool = options?.defaultsOnly
    ? entries.filter((e) => e.isDefault && !e.isCostume)
    : entries;

  // Precompute owned keys for family progress
  const ownedKeys = new Set<string>();
  for (const e of entries) {
    const insts = instancesForEntry(e, index);
    if (resolveStatus(insts) === 'caught') ownedKeys.add(e.key);
  }

  const familyMembers = new Map<number, PogoDexEntry[]>();
  for (const e of entries) {
    if (e.isCostume) continue;
    const list = familyMembers.get(e.family) ?? [];
    // Prefer default forms for family progress counts
    if (e.isDefault || !list.some((x) => x.speciesId === e.speciesId && x.isDefault)) {
      list.push(e);
    }
    familyMembers.set(e.family, list);
  }

  // Deduplicate family members by species default
  for (const [fam, list] of familyMembers) {
    const defaults = list.filter((e) => e.isDefault);
    familyMembers.set(fam, defaults.length > 0 ? defaults : list);
  }

  return pool.map((entry) => {
    const insts = instancesForEntry(entry, index);
    const status = resolveStatus(insts);
    const flags = aggregateFlags(insts);
    if (entry.isCostume && status === 'caught') flags.costume = true;

    const family = familyMembers.get(entry.family) ?? [entry];
    const owned = family.filter((m) => ownedKeys.has(m.key)).length;

    const candy =
      insts.reduce<number | undefined>((max, i) => {
        if (i.candy == null) return max;
        return max == null ? i.candy : Math.max(max, i.candy);
      }, undefined) ?? index.candyBySpecies.get(entry.speciesId);

    return {
      entry,
      status,
      flags,
      candy,
      evolutionProgress: { owned, total: Math.max(family.length, 1) },
    };
  });
}

export function caughtKeySet(rows: AggregatedDexRow[]): Set<string> {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.status === 'caught') set.add(r.entry.key);
  }
  return set;
}

export function completionStats(rows: AggregatedDexRow[]): {
  caught: number;
  seen: number;
  total: number;
  percent: number;
} {
  const total = rows.length;
  const caught = rows.filter((r) => r.status === 'caught').length;
  const seen = rows.filter((r) => r.status === 'seen' || r.status === 'caught').length;
  return {
    caught,
    seen,
    total,
    percent: total === 0 ? 0 : Math.round((caught / total) * 1000) / 10,
  };
}

export function matchesFilter(row: AggregatedDexRow, filter: DexFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'missing':
      return row.status === 'not_seen';
    case 'seen':
      return row.status === 'seen';
    case 'caught':
      return row.status === 'caught';
    case 'unevolved':
      return (
        row.status === 'caught' &&
        row.evolutionProgress.owned < row.evolutionProgress.total &&
        row.evolutionProgress.total > 1
      );
    case 'shiny':
      return row.flags.shiny;
    case 'shadow':
      return row.flags.shadow;
    case 'purified':
      return row.flags.purified;
    case 'lucky':
      return row.flags.lucky;
    case 'hundo':
      return row.flags.hundo;
    case 'mega':
      return row.flags.mega || row.entry.hasTempEvolutions;
    case 'primal':
      return row.flags.primal;
    case 'dynamax':
      return row.flags.dynamax;
    case 'gigantamax':
      return row.flags.gigantamax || row.entry.hasGmax;
    case 'costumes':
      return row.entry.isCostume || row.flags.costume;
    case 'forms':
      return !row.entry.isDefault && !row.entry.isCostume;
    case 'regional':
      return row.entry.isRegional;
    default:
      return true;
  }
}

export function searchRows(
  rows: AggregatedDexRow[],
  query: string,
  options?: { filter?: DexFilter; generation?: string | null; type?: string | null }
): AggregatedDexRow[] {
  const filter = options?.filter ?? 'all';
  const gen = options?.generation?.toLowerCase() || null;
  const type = options?.type?.toLowerCase() || null;
  const q = query.trim().toLowerCase();

  return rows.filter((row) => {
    if (!matchesFilter(row, filter)) return false;
    if (gen && row.entry.generation.toLowerCase() !== gen && String(row.entry.genId) !== gen) {
      return false;
    }
    if (type && !row.entry.types.includes(type)) return false;
    if (!q) return true;

    // Status / keyword shortcuts
    if (q === 'shiny') return row.flags.shiny;
    if (q === 'shadow') return row.flags.shadow;
    if (q === 'lucky') return row.flags.lucky;
    if (q === 'hundo') return row.flags.hundo;
    if (q === 'missing') return row.status === 'not_seen';
    if (q === 'caught') return row.status === 'caught';
    if (q === 'seen') return row.status === 'seen';
    if (q.includes('missing evolution') || q === 'unevolved') {
      return (
        row.status === 'caught' &&
        row.evolutionProgress.owned < row.evolutionProgress.total
      );
    }

    const dexNum = q.replace(/^#/, '');
    if (/^\d+$/.test(dexNum) && row.entry.speciesId === Number(dexNum)) return true;

    if (row.entry.displayName.toLowerCase().includes(q)) return true;
    if (row.entry.name.toLowerCase().includes(q)) return true;
    if (row.entry.formName.toLowerCase().includes(q)) return true;
    if (row.entry.types.some((t) => t.includes(q))) return true;
    if (row.entry.generation.toLowerCase().includes(q)) return true;
    return false;
  });
}
