'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFamilies } from '@/lib/pokemon-go/use-collector-data';
import { usePokemonGoSettingsStore } from '@/store/pokemon-go-settings-store';
import { EmptyCollection } from '@/components/pokemon-go/EmptyCollection';
import { ErrorState } from '@/components/pokemon-go/ErrorState';
import { ProgressBar } from '@/components/pokemon-go/ProgressBar';
import { StatusIcon } from '@/components/pokemon-go/StatusIcon';
import {
  getIncompleteFamilies,
  getMissingEdges,
  getReadyEdges,
} from '@/lib/pokemon-go/evolutions';
import { cn } from '@/lib/utils';
import { track } from '@/lib/analytics';

const VIEWS = [
  { id: 'unevolved' as const, label: 'Unevolved' },
  { id: 'ready' as const, label: 'Ready to evolve' },
  { id: 'missing' as const, label: 'Missing evolutions' },
  { id: 'all' as const, label: 'All families' },
];

export default function EvolutionsPage() {
  return (
    <Suspense fallback={<p className="text-foreground/60">Loading evolutions…</p>}>
      <EvolutionsPageInner />
    </Suspense>
  );
}

function EvolutionsPageInner() {
  const { families, loading, error, collection } = useFamilies();
  const searchParams = useSearchParams();
  const view = usePokemonGoSettingsStore((s) => s.evolutionView);
  const setEvolutionView = usePokemonGoSettingsStore((s) => s.setEvolutionView);
  const showCompleted = usePokemonGoSettingsStore((s) => s.showCompletedFamilies);
  const setShowCompleted = usePokemonGoSettingsStore((s) => s.setShowCompletedFamilies);

  useEffect(() => {
    const v = searchParams.get('view');
    if (v === 'ready' || v === 'missing' || v === 'unevolved' || v === 'all') {
      setEvolutionView(v);
    }
    track('evolution_goal_open', { view: v ?? 'unevolved' });
  }, [searchParams, setEvolutionView]);

  const incomplete = useMemo(() => getIncompleteFamilies(families), [families]);
  const ready = useMemo(() => getReadyEdges(families), [families]);
  const missing = useMemo(() => getMissingEdges(families), [families]);

  const familyList = useMemo(() => {
    if (view === 'unevolved') return incomplete;
    if (view === 'all') {
      return showCompleted ? families.filter((f) => f.totalCount > 1) : incomplete;
    }
    return incomplete;
  }, [view, incomplete, families, showCompleted]);

  if (loading) return <p className="text-foreground/60">Loading evolutions…</p>;
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
        <h1 className="text-2xl md:text-3xl font-display font-bold">Evolutions</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Track incomplete families, ready evolutions, and missing requirements.
        </p>
      </header>

      {!collection && <EmptyCollection />}

      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setEvolutionView(v.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              view === v.id ? 'bg-brand-500 text-white' : 'glass text-foreground/70'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === 'ready' && (
        <section className="space-y-3">
          <h2 className="font-semibold">Ready to evolve · {ready.length}</h2>
          {ready.length === 0 ? (
            <p className="text-sm text-foreground/60">
              No evolutions marked ready. Candy counts in your import unlock this view.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-foreground/50">
                  <tr>
                    <th className="py-2 pr-3">Pokémon</th>
                    <th className="py-2 pr-3">Evolution</th>
                    <th className="py-2">Requirement</th>
                  </tr>
                </thead>
                <tbody>
                  {ready.map((e) => (
                    <tr key={`${e.fromKey}-${e.toKey}`} className="border-t border-border">
                      <td className="py-2 pr-3">{e.fromName}</td>
                      <td className="py-2 pr-3">{e.toName}</td>
                      <td className="py-2 text-emerald-600 dark:text-emerald-400">✓ Ready · {e.requirementLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {view === 'missing' && (
        <section className="space-y-3">
          <h2 className="font-semibold">Missing evolutions · {missing.length}</h2>
          <ul className="space-y-2">
            {missing.slice(0, 100).map((e) => (
              <li key={`${e.fromKey}-${e.toKey}`} className="glass rounded-lg p-3 text-sm">
                <div className="font-medium">
                  {e.fromName} → {e.toName}
                </div>
                <div className="text-foreground/60 text-xs mt-1">
                  Reason: {e.requirementLabel}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(view === 'unevolved' || view === 'all') && (
        <section className="space-y-4">
          {view === 'all' && (
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
              Show completed families
            </label>
          )}
          <p className="text-sm text-foreground/50">{familyList.length} families</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {familyList.map((fam) => (
              <article key={fam.familyId} className="glass-card rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide">{fam.name}</h3>
                <ProgressBar value={fam.ownedCount} max={fam.totalCount} />
                <ul className="space-y-1">
                  {fam.members.map((m) => (
                    <li key={m.entry.key} className="flex items-center justify-between text-sm">
                      <Link
                        href={`/pokemon-go/pokedex/${encodeURIComponent(m.entry.key)}`}
                        className="hover:underline"
                      >
                        {m.entry.name}
                      </Link>
                      <StatusIcon ok={m.owned} label="Owned" />
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
