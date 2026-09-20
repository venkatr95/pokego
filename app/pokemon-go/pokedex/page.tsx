'use client';

import { useEffect, useMemo } from 'react';
import { useFilteredDex } from '@/lib/pokemon-go/use-collector-data';
import { usePokemonGoSettingsStore } from '@/store/pokemon-go-settings-store';
import { FilterChips } from '@/components/pokemon-go/FilterChips';
import { VirtualizedDexGrid } from '@/components/pokemon-go/VirtualizedDexGrid';
import { ProgressBar } from '@/components/pokemon-go/ProgressBar';
import { EmptyCollection } from '@/components/pokemon-go/EmptyCollection';
import { ErrorState } from '@/components/pokemon-go/ErrorState';
import type { DexFilter, GenerationProgress } from '@/types/pokemon-go';
import { track } from '@/lib/analytics';
import Link from 'next/link';

export default function PokedexPage() {
  const { filtered, stats, loading, error, collection, rows } = useFilteredDex(true);
  const filter = usePokemonGoSettingsStore((s) => s.filter);
  const search = usePokemonGoSettingsStore((s) => s.search);
  const generation = usePokemonGoSettingsStore((s) => s.generation);
  const type = usePokemonGoSettingsStore((s) => s.type);
  const setFilter = usePokemonGoSettingsStore((s) => s.setFilter);
  const setSearch = usePokemonGoSettingsStore((s) => s.setSearch);
  const setGeneration = usePokemonGoSettingsStore((s) => s.setGeneration);
  const setType = usePokemonGoSettingsStore((s) => s.setType);

  useEffect(() => {
    track('pokemon_go_open', { surface: 'pokedex' });
  }, []);

  const onFilter = (f: DexFilter) => {
    setFilter(f);
    track('pokedex_filter', { filter: f });
  };

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) r.entry.types.forEach((t) => set.add(t));
    return [...set].sort();
  }, [rows]);

  const gens: GenerationProgress[] = useMemo(() => {
    const byGen = new Map<number, { name: string; total: number; caught: number }>();
    for (const r of rows) {
      const g = byGen.get(r.entry.genId) ?? {
        name: r.entry.generation,
        total: 0,
        caught: 0,
      };
      g.total += 1;
      if (r.status === 'caught') g.caught += 1;
      byGen.set(r.entry.genId, g);
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
  }, [rows]);

  const wipBanner = (
    <div
      role="status"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-red-600 dark:text-red-400"
    >
      Work in Progress!
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {wipBanner}
        <p className="text-foreground/60">Loading Pokédex…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {wipBanner}
        <ErrorState
          title="Pokémon GO data is temporarily unavailable"
          message="Your saved collection remains available."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {wipBanner}
      <header className="space-y-3">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Pokémon GO Pokédex</h1>
        <ProgressBar value={stats.caught} max={stats.total} label="Collection completion" />
      </header>

      {!collection && (
        <EmptyCollection
          onImportClick={() => {
            window.location.href = '/pokemon-go/collection';
          }}
        />
      )}

      <FilterChips value={filter} onChange={onFilter} />

      <div className="flex flex-col md:flex-row gap-3">
        <label className="flex-1">
          <span className="sr-only">Search Pokémon</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Pokémon… (#025, shiny, missing evolution)"
            className="w-full glass rounded-lg px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </label>
        <label>
          <span className="sr-only">Generation</span>
          <select
            value={generation ?? ''}
            onChange={(e) => setGeneration(e.target.value || null)}
            className="glass rounded-lg px-3 py-2 text-sm bg-card text-foreground min-w-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <option value="">Generation</option>
            {gens.map((g) => (
              <option key={g.genId} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Type</span>
          <select
            value={type ?? ''}
            onChange={(e) => setType(e.target.value || null)}
            className="glass rounded-lg px-3 py-2 text-sm bg-card text-foreground min-w-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <option value="">Type</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      {gens.length > 0 && (
        <section aria-label="Generation progress" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {gens.map((g) => (
            <button
              key={g.genId}
              type="button"
              onClick={() => setGeneration(generation === g.name ? null : g.name)}
              className={`glass rounded-lg p-3 text-left text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                generation === g.name ? 'ring-2 ring-brand-500' : ''
              }`}
            >
              <div className="font-medium text-sm mb-1">{g.name}</div>
              <div className="text-foreground/60">
                {g.caught} / {g.total} · {g.percent}%
              </div>
            </button>
          ))}
        </section>
      )}

      <p className="text-sm text-foreground/50">
        Showing {filtered.length.toLocaleString()} of {stats.total.toLocaleString()}
      </p>

      <VirtualizedDexGrid rows={filtered} />

      <p className="text-sm text-foreground/50">
        Manage import, companion, and cloud sync on the{' '}
        <Link href="/pokemon-go/collection" className="text-brand-600 dark:text-brand-400 underline">
          Collection
        </Link>{' '}
        page.
      </p>
    </div>
  );
}
