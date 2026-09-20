import { useEffect, useMemo } from 'react';
import {
  buildAggregatedRows,
  buildEvolutionFamilies,
  buildGoalsSummary,
  completionStats,
  searchRows,
  type DexFilter,
} from '@pokeyou/pokemon-go-core';
import { getCollectorIndex, getDefaultEntries } from './master-data';
import { useCollectionStore } from '../store/collection-store';

export function useCollectorHydration() {
  const hydrate = useCollectionStore((s) => s.hydrate);
  const loadState = useCollectionStore((s) => s.loadState);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return { loadState };
}

export function useDex(defaultsOnly = true, filter: DexFilter = 'all', query = '') {
  useCollectorHydration();
  const collection = useCollectionStore((s) => s.collection);
  const entries = useMemo(
    () => (defaultsOnly ? getDefaultEntries() : getCollectorIndex()),
    [defaultsOnly]
  );
  const rows = useMemo(
    () => buildAggregatedRows(entries, collection, { defaultsOnly }),
    [entries, collection, defaultsOnly]
  );
  const filtered = useMemo(
    () => searchRows(rows, query, { filter }),
    [rows, query, filter]
  );
  const stats = useMemo(() => completionStats(rows), [rows]);
  return { rows, filtered, stats, collection, entries };
}

export function useGoals() {
  useCollectorHydration();
  const collection = useCollectionStore((s) => s.collection);
  const entries = useMemo(() => getCollectorIndex(), []);
  const summary = useMemo(
    () => buildGoalsSummary(entries, collection, ''),
    [entries, collection]
  );
  return { summary, collection };
}

export function useFamilies() {
  useCollectorHydration();
  const collection = useCollectionStore((s) => s.collection);
  const entries = useMemo(() => getCollectorIndex(), []);
  const families = useMemo(
    () => buildEvolutionFamilies(entries, collection),
    [entries, collection]
  );
  return { families, collection };
}
