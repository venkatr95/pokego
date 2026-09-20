'use client';

import { Suspense, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAggregatedDex } from '@/lib/pokemon-go/use-collector-data';
import { usePokemonGoSettingsStore } from '@/store/pokemon-go-settings-store';
import { FilterChips } from '@/components/pokemon-go/FilterChips';
import { VirtualizedDexGrid } from '@/components/pokemon-go/VirtualizedDexGrid';
import { EmptyCollection } from '@/components/pokemon-go/EmptyCollection';
import { ErrorState } from '@/components/pokemon-go/ErrorState';
import { matchesFilter, searchRows } from '@/lib/pokemon-go/engine';
import type { DexFilter } from '@/types/pokemon-go';
import { track } from '@/lib/analytics';

export default function MissingPage() {
  return (
    <Suspense fallback={<p className="text-foreground/60">Loading…</p>}>
      <MissingPageInner />
    </Suspense>
  );
}

function MissingPageInner() {
  const { rows, loading, error, collection } = useAggregatedDex(true);
  const searchParams = useSearchParams();
  const filter = usePokemonGoSettingsStore((s) => s.filter);
  const setFilter = usePokemonGoSettingsStore((s) => s.setFilter);

  useEffect(() => {
    track('missing_goal_open', { filter: searchParams.get('filter') ?? 'missing' });
  }, [searchParams]);

  useEffect(() => {
    const f = searchParams.get('filter') as DexFilter | null;
    if (f) setFilter(f);
    else if (!searchParams.get('filter')) setFilter('missing');
  }, [searchParams, setFilter]);

  const onFilter = (f: DexFilter) => {
    setFilter(f);
    track('pokedex_filter', { filter: f, surface: 'missing' });
  };

  const list = useMemo(() => {
    // For "missing shiny/shadow/..." show species that don't have that flag yet
    if (filter === 'shiny') {
      return rows.filter((r) => !r.flags.shiny);
    }
    if (filter === 'shadow') return rows.filter((r) => !r.flags.shadow);
    if (filter === 'purified') return rows.filter((r) => !r.flags.purified);
    if (filter === 'lucky') return rows.filter((r) => !r.flags.lucky);
    if (filter === 'hundo') return rows.filter((r) => !r.flags.hundo);
    if (filter === 'mega') return rows.filter((r) => r.entry.hasTempEvolutions && !r.flags.mega);
    if (filter === 'dynamax') return rows.filter((r) => !r.flags.dynamax);
    if (filter === 'gigantamax') return rows.filter((r) => r.entry.hasGmax && !r.flags.gigantamax);
    if (filter === 'missing' || filter === 'all') {
      return searchRows(rows, '', { filter: 'missing' });
    }
    return rows.filter((r) => matchesFilter(r, filter));
  }, [rows, filter]);

  if (loading) return <p className="text-foreground/60">Loading…</p>;
  if (error) {
    return (
      <ErrorState
        title="Pokémon GO data is temporarily unavailable"
        message="Your saved collection remains available."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Missing</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Drill into missing Pokédex entries and special collection categories.
        </p>
      </header>

      {!collection && <EmptyCollection />}

      <FilterChips value={filter} onChange={onFilter} />

      <p className="text-sm text-foreground/50">
        {list.length.toLocaleString()} missing
        {filter !== 'all' && filter !== 'missing' ? ` for “${filter}”` : ''}
      </p>

      <VirtualizedDexGrid rows={list} />

      <p className="text-sm text-foreground/50">
        Prefer the full Pokédex search?{' '}
        <Link href="/pokemon-go/pokedex" className="text-brand-600 dark:text-brand-400 underline">
          Open Pokédex
        </Link>
      </p>
    </div>
  );
}
