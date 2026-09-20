// ============================================================
// Cloud sync: PokemonGoCollection ↔ structured Supabase rows
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PokemonGoCollection, PokemonGoInstance } from '@/types/pokemon-go';
import { makeDexKey } from '@/types/pokemon-go';
import { resolveHundo } from './hundo';

export type GoCollectionSource = 'import' | 'companion' | 'manual' | 'official';

export interface GoCollectionMetaRow {
  user_id: string;
  trainer_id: string | null;
  trainer_nickname: string | null;
  source: GoCollectionSource;
  imported_at: string | null;
  updated_at: string;
  sync_enabled: boolean;
}

export interface GoCollectionEntryRow {
  user_id: string;
  species_id: number;
  form_id: number;
  seen: boolean;
  caught: boolean;
  shiny: boolean;
  shadow: boolean;
  purified: boolean;
  lucky: boolean;
  hundo: boolean;
  mega: boolean;
  primal: boolean;
  dynamax: boolean;
  gigantamax: boolean;
  gender: 'male' | 'female' | 'unknown' | null;
  costume_id: number | null;
  candy: number | null;
  cp: number | null;
  iv_attack: number | null;
  iv_defense: number | null;
  iv_stamina: number | null;
  updated_at: string;
}

/** Collapse instances to one row per species+form (OR flags). */
export function aggregateInstances(pokemon: PokemonGoInstance[]): PokemonGoInstance[] {
  const map = new Map<string, PokemonGoInstance>();
  for (const raw of pokemon) {
    const formId = raw.formId ?? 0;
    const key = makeDexKey(raw.speciesId, formId);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        ...raw,
        formId,
        hundo: resolveHundo(raw),
      });
      continue;
    }
    map.set(key, mergeInstances(prev, { ...raw, formId }));
  }
  return [...map.values()];
}

export function mergeInstances(a: PokemonGoInstance, b: PokemonGoInstance): PokemonGoInstance {
  const candy =
    a.candy == null ? b.candy : b.candy == null ? a.candy : Math.max(a.candy, b.candy);
  const cp = a.cp == null ? b.cp : b.cp == null ? a.cp : Math.max(a.cp, b.cp);
  const iv = a.iv && b.iv ? a.iv : a.iv ?? b.iv;
  const merged: PokemonGoInstance = {
    speciesId: a.speciesId,
    formId: a.formId ?? b.formId ?? 0,
    seen: !!(a.seen || b.seen || a.caught || b.caught),
    caught: !!(a.caught || b.caught),
    shiny: !!(a.shiny || b.shiny),
    shadow: !!(a.shadow || b.shadow),
    purified: !!(a.purified || b.purified),
    lucky: !!(a.lucky || b.lucky),
    mega: !!(a.mega || b.mega),
    primal: !!(a.primal || b.primal),
    dynamax: !!(a.dynamax || b.dynamax),
    gigantamax: !!(a.gigantamax || b.gigantamax),
    candy,
    cp,
    iv,
    costumeId: a.costumeId ?? b.costumeId,
    gender: a.gender ?? b.gender,
  };
  merged.hundo = resolveHundo({ hundo: !!(a.hundo || b.hundo), iv: merged.iv });
  return merged;
}

export function mergeCollections(
  local: PokemonGoCollection | null,
  remote: PokemonGoCollection | null
): PokemonGoCollection {
  if (!local && !remote) {
    return {
      importedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pokemon: [],
    };
  }
  if (!local) return remote!;
  if (!remote) return local;

  const localNewer =
    (local.updatedAt ?? local.importedAt) >= (remote.updatedAt ?? remote.importedAt);

  const byKey = new Map<string, PokemonGoInstance>();
  for (const p of aggregateInstances([...remote.pokemon, ...local.pokemon])) {
    const key = makeDexKey(p.speciesId, p.formId ?? 0);
    const existing = byKey.get(key);
    byKey.set(key, existing ? mergeInstances(existing, p) : p);
  }

  const trainer = localNewer
    ? local.trainer ?? remote.trainer
    : remote.trainer ?? local.trainer;

  return {
    trainer,
    importedAt: local.importedAt ?? remote.importedAt,
    updatedAt: new Date().toISOString(),
    pokemon: [...byKey.values()],
  };
}

export function collectionToEntryRows(
  userId: string,
  collection: PokemonGoCollection
): GoCollectionEntryRow[] {
  const now = collection.updatedAt ?? new Date().toISOString();
  return aggregateInstances(collection.pokemon).map((p) => ({
    user_id: userId,
    species_id: p.speciesId,
    form_id: p.formId ?? 0,
    seen: !!(p.seen || p.caught),
    caught: !!p.caught,
    shiny: !!p.shiny,
    shadow: !!p.shadow,
    purified: !!p.purified,
    lucky: !!p.lucky,
    hundo: resolveHundo(p),
    mega: !!p.mega,
    primal: !!p.primal,
    dynamax: !!p.dynamax,
    gigantamax: !!p.gigantamax,
    gender: p.gender ?? null,
    costume_id: p.costumeId ?? null,
    candy: p.candy ?? null,
    cp: p.cp ?? null,
    iv_attack: p.iv?.attack ?? null,
    iv_defense: p.iv?.defense ?? null,
    iv_stamina: p.iv?.stamina ?? null,
    updated_at: now,
  }));
}

export function rowsToCollection(
  meta: GoCollectionMetaRow | null,
  entries: GoCollectionEntryRow[]
): PokemonGoCollection | null {
  if (!meta && entries.length === 0) return null;
  return {
    trainer:
      meta?.trainer_id || meta?.trainer_nickname
        ? {
            trainerId: meta.trainer_id ?? undefined,
            nickname: meta.trainer_nickname ?? undefined,
          }
        : undefined,
    importedAt: meta?.imported_at ?? meta?.updated_at ?? new Date().toISOString(),
    updatedAt: meta?.updated_at ?? new Date().toISOString(),
    pokemon: entries.map((e) => {
      const iv =
        e.iv_attack != null && e.iv_defense != null && e.iv_stamina != null
          ? { attack: e.iv_attack, defense: e.iv_defense, stamina: e.iv_stamina }
          : undefined;
      return {
        speciesId: e.species_id,
        formId: e.form_id,
        seen: e.seen,
        caught: e.caught,
        shiny: e.shiny,
        shadow: e.shadow,
        purified: e.purified,
        lucky: e.lucky,
        hundo: e.hundo,
        mega: e.mega,
        primal: e.primal,
        dynamax: e.dynamax,
        gigantamax: e.gigantamax,
        gender: e.gender ?? undefined,
        costumeId: e.costume_id ?? undefined,
        candy: e.candy ?? undefined,
        cp: e.cp ?? undefined,
        iv,
      } satisfies PokemonGoInstance;
    }),
  };
}

export async function pullCollection(
  supabase: SupabaseClient,
  userId: string
): Promise<{ collection: PokemonGoCollection | null; syncEnabled: boolean }> {
  const { data: meta, error: metaErr } = await supabase
    .from('go_collections')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (metaErr) throw metaErr;

  const { data: entries, error: entryErr } = await supabase
    .from('go_collection_entries')
    .select('*')
    .eq('user_id', userId);

  if (entryErr) throw entryErr;

  return {
    collection: rowsToCollection(
      (meta as GoCollectionMetaRow | null) ?? null,
      (entries as GoCollectionEntryRow[]) ?? []
    ),
    syncEnabled: meta ? !!(meta as GoCollectionMetaRow).sync_enabled : true,
  };
}

export async function pushCollection(
  supabase: SupabaseClient,
  userId: string,
  collection: PokemonGoCollection,
  options?: { source?: GoCollectionSource; syncEnabled?: boolean }
): Promise<void> {
  const now = new Date().toISOString();
  const source = options?.source ?? 'manual';
  const syncEnabled = options?.syncEnabled ?? true;

  const { error: metaErr } = await supabase.from('go_collections').upsert(
    {
      user_id: userId,
      trainer_id: collection.trainer?.trainerId ?? null,
      trainer_nickname: collection.trainer?.nickname ?? null,
      source,
      imported_at: collection.importedAt ?? now,
      updated_at: collection.updatedAt ?? now,
      sync_enabled: syncEnabled,
    },
    { onConflict: 'user_id' }
  );
  if (metaErr) throw metaErr;

  // Replace entries for this user (simple, correct for aggregated rows)
  const { error: delErr } = await supabase
    .from('go_collection_entries')
    .delete()
    .eq('user_id', userId);
  if (delErr) throw delErr;

  const rows = collectionToEntryRows(userId, collection);
  if (rows.length === 0) return;

  // Batch insert (Supabase soft limit ~1000 rows/request)
  const chunk = 500;
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await supabase.from('go_collection_entries').insert(slice);
    if (error) throw error;
  }
}

export async function setSyncEnabled(
  supabase: SupabaseClient,
  userId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase.from('go_collections').upsert(
    {
      user_id: userId,
      sync_enabled: enabled,
      updated_at: new Date().toISOString(),
      source: 'manual',
    },
    { onConflict: 'user_id' }
  );
  if (error) throw error;
}
