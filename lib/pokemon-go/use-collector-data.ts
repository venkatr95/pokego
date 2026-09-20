'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PogoDexEntry } from '@/types/pokemon-go';
import { usePokemonGoCollectionStore } from '@/store/pokemon-go-collection-store';
import { buildAggregatedRows, completionStats, searchRows } from './engine';
import { buildEvolutionFamilies } from './evolutions';
import { buildGoalsSummary } from './goals';
import { usePokemonGoSettingsStore } from '@/store/pokemon-go-settings-store';

export function useMasterEntries(defaultsOnly = false) {
  const [entries, setEntries] = useState<PogoDexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/pokemon-go/pokemon?defaults=${defaultsOnly ? '1' : '0'}`
        );
        if (!res.ok) throw new Error('unavailable');
        const data = await res.json();
        if (!cancelled) {
          setEntries(data.entries ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Pokémon GO data is temporarily unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [defaultsOnly]);

  return { entries, loading, error };
}

export function useCollectorHydration() {
  const hydrate = usePokemonGoCollectionStore((s) => s.hydrate);
  const loadState = usePokemonGoCollectionStore((s) => s.loadState);
  const hasHydrated = usePokemonGoCollectionStore((s) => s.hasHydrated);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return { loadState, hasHydrated };
}

export function useAggregatedDex(defaultsOnly = true) {
  const { entries, loading, error } = useMasterEntries(defaultsOnly);
  const collection = usePokemonGoCollectionStore((s) => s.collection);
  useCollectorHydration();

  const rows = useMemo(
    () => buildAggregatedRows(entries, collection, { defaultsOnly }),
    [entries, collection, defaultsOnly]
  );

  const stats = useMemo(() => completionStats(rows), [rows]);

  return { entries, rows, stats, loading, error, collection };
}

export function useFilteredDex(defaultsOnly = true) {
  const base = useAggregatedDex(defaultsOnly);
  const filter = usePokemonGoSettingsStore((s) => s.filter);
  const search = usePokemonGoSettingsStore((s) => s.search);
  const generation = usePokemonGoSettingsStore((s) => s.generation);
  const type = usePokemonGoSettingsStore((s) => s.type);

  const filtered = useMemo(
    () =>
      searchRows(base.rows, search, {
        filter,
        generation,
        type,
      }),
    [base.rows, search, filter, generation, type]
  );

  return { ...base, filtered, filter, search, generation, type };
}

export function useFamilies() {
  const { entries, loading, error, collection } = useAggregatedDex(false);
  const families = useMemo(
    () => buildEvolutionFamilies(entries, collection),
    [entries, collection]
  );
  return { families, loading, error, collection };
}

export function useGoals() {
  const { entries, loading, error, collection } = useAggregatedDex(false);
  const summary = useMemo(
    () => buildGoalsSummary(entries, collection),
    [entries, collection]
  );
  return { summary, loading, error, collection };
}
