'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAggregatedDex } from '@/lib/pokemon-go/use-collector-data';
import { EmptyCollection } from '@/components/pokemon-go/EmptyCollection';
import { ErrorState } from '@/components/pokemon-go/ErrorState';
import { VirtualizedFormsList } from '@/components/pokemon-go/VirtualizedFormsList';

export default function FormsPage() {
  return (
    <Suspense fallback={<p className="text-foreground/60">Loading forms…</p>}>
      <FormsPageInner />
    </Suspense>
  );
}

function FormsPageInner() {
  const { rows, loading, error, collection } = useAggregatedDex(false);
  const searchParams = useSearchParams();
  const missingOnly = searchParams.get('missing') === '1';
  const costumesOnly = searchParams.get('costumes') === '1';
  const regionalsOnly = searchParams.get('regionals') === '1';

  const grouped = useMemo(() => {
    let pool = rows.filter((r) => !r.entry.isDefault || r.entry.isCostume || r.entry.isRegional);
    if (costumesOnly) pool = pool.filter((r) => r.entry.isCostume);
    if (regionalsOnly) pool = pool.filter((r) => r.entry.isRegional);
    if (missingOnly) pool = pool.filter((r) => r.status !== 'caught');

    const map = new Map<number, typeof pool>();
    for (const r of pool) {
      const list = map.get(r.entry.speciesId) ?? [];
      list.push(r);
      map.set(r.entry.speciesId, list);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [rows, missingOnly, costumesOnly, regionalsOnly]);

  if (loading) return <p className="text-foreground/60">Loading forms…</p>;
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
        <h1 className="text-2xl md:text-3xl font-display font-bold">Forms</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Forms and regional variants are tracked as separate collection entities.
        </p>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          <Link href="/pokemon-go/forms" className="glass rounded-full px-3 py-1.5">
            All forms
          </Link>
          <Link href="/pokemon-go/forms?missing=1" className="glass rounded-full px-3 py-1.5">
            Missing
          </Link>
          <Link href="/pokemon-go/forms?regionals=1" className="glass rounded-full px-3 py-1.5">
            Regionals
          </Link>
          <Link href="/pokemon-go/forms?costumes=1" className="glass rounded-full px-3 py-1.5">
            Costumes
          </Link>
        </div>
      </header>

      {!collection && <EmptyCollection />}

      <p className="text-sm text-foreground/50">{grouped.length} species with form variants</p>

      <VirtualizedFormsList groups={grouped} />
    </div>
  );
}
