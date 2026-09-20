'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useGoals } from '@/lib/pokemon-go/use-collector-data';
import { EmptyCollection } from '@/components/pokemon-go/EmptyCollection';
import { ErrorState } from '@/components/pokemon-go/ErrorState';
import { track } from '@/lib/analytics';

export default function GoalsPage() {
  const { summary, loading, error, collection } = useGoals();

  useEffect(() => {
    track('pokemon_go_open', { surface: 'goals' });
  }, []);

  if (loading) return <p className="text-foreground/60">Loading goals…</p>;
  if (error) {
    return (
      <ErrorState
        title="Pokémon GO data is temporarily unavailable"
        message="Your saved collection remains available."
        onRetry={() => window.location.reload()}
      />
    );
  }

  const cards = [
    { label: '🔥 Ready to evolve', count: summary.readyToEvolve, href: '/pokemon-go/evolutions?view=ready' },
    {
      label: '🧬 Incomplete evolution families',
      count: summary.incompleteFamilies,
      href: '/pokemon-go/evolutions?view=unevolved',
    },
    { label: '📖 Missing Pokédex entries', count: summary.missingPokedex, href: '/pokemon-go/missing?filter=missing' },
    { label: '✨ Missing shiny', count: summary.missingShiny, href: '/pokemon-go/missing?filter=shiny' },
    { label: '👻 Missing shadow', count: summary.missingShadow, href: '/pokemon-go/missing?filter=shadow' },
    { label: '🍀 Missing lucky', count: summary.missingLucky, href: '/pokemon-go/missing?filter=lucky' },
    { label: '💯 Missing hundo', count: summary.missingHundo, href: '/pokemon-go/missing?filter=hundo' },
    { label: '🧩 Missing forms', count: summary.missingForms, href: '/pokemon-go/forms?missing=1' },
    { label: '🎭 Missing costumes', count: summary.missingCostumes, href: '/pokemon-go/forms?costumes=1&missing=1' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Your Goals</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Actionable completion goals ranked so you know what to work on next.
        </p>
      </header>

      {!collection && <EmptyCollection />}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="glass-card rounded-xl p-4 flex items-center justify-between hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="text-sm font-medium pr-3">{c.label}</span>
            <span className="text-xl font-display font-bold tabular-nums">{c.count}</span>
          </Link>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Next Goals</h2>
        {summary.nextGoals.length === 0 ? (
          <p className="text-sm text-foreground/60">
            {collection
              ? 'Import more progress or catch Pokémon to generate next goals.'
              : 'Import a collection to generate next goals.'}
          </p>
        ) : (
          <ol className="space-y-2">
            {summary.nextGoals.map((g, i) => (
              <li key={g.id}>
                <Link
                  href={g.href}
                  className="glass rounded-xl p-4 flex gap-3 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="text-foreground/40 font-mono text-sm w-6">{i + 1}.</span>
                  <div>
                    <div className="font-medium text-sm">{g.title}</div>
                    <div className="text-xs text-foreground/60 mt-0.5">{g.subtitle}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
