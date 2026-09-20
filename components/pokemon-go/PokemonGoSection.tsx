'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAggregatedDex, useCollectorHydration, useFamilies } from '@/lib/pokemon-go/use-collector-data';
import { StatusIcon } from './StatusIcon';
import { ProgressBar } from './ProgressBar';
import { track } from '@/lib/analytics';
import { useEffect } from 'react';

/**
 * Pokémon GO collection block for species detail pages.
 */
export function PokemonGoSection({ speciesId }: { speciesId: number }) {
  useCollectorHydration();
  const { rows, loading, collection } = useAggregatedDex(false);
  const { families } = useFamilies();

  useEffect(() => {
    track('pokemon_detail_open', { speciesId, surface: 'pokemon_page' });
  }, [speciesId]);

  const speciesRows = useMemo(
    () => rows.filter((r) => r.entry.speciesId === speciesId),
    [rows, speciesId]
  );

  const defaultRow = useMemo(
    () => speciesRows.find((r) => r.entry.isDefault) ?? speciesRows[0],
    [speciesRows]
  );

  const family = useMemo(
    () =>
      defaultRow
        ? families.find((f) => f.familyId === defaultRow.entry.family)
        : undefined,
    [families, defaultRow]
  );

  if (loading) {
    return (
      <section className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold mb-2">Your Collection</h2>
        <p className="text-sm text-foreground/60">Loading Pokémon GO data…</p>
      </section>
    );
  }

  if (!defaultRow) {
    return (
      <section className="glass-card rounded-2xl p-5 space-y-2">
        <h2 className="font-semibold">Pokémon GO</h2>
        <p className="text-sm text-foreground/60">
          This species is not in the current Pokémon GO master data.
        </p>
        <Link href="/pokemon-go/pokedex" className="text-sm text-brand-600 dark:text-brand-400 underline">
          Open Pokémon GO Pokédex
        </Link>
      </section>
    );
  }

  const { flags, status, entry } = defaultRow;

  return (
    <section className="glass-card rounded-2xl p-5 space-y-5" aria-labelledby="go-collection-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="go-collection-heading" className="font-semibold text-lg">
            Your Collection
          </h2>
          <p className="text-xs text-foreground/50 mt-1">
            Pokémon GO · stored locally on this device
          </p>
        </div>
        <Link
          href={`/pokemon-go/pokedex/${encodeURIComponent(entry.key)}`}
          className="text-xs text-brand-600 dark:text-brand-400 hover:underline shrink-0"
        >
          Open in GO tracker
        </Link>
      </div>

      {!collection && (
        <p className="text-sm text-foreground/60">
          No collection imported yet.{' '}
          <Link href="/pokemon-go/collection" className="text-brand-600 dark:text-brand-400 underline">
            Import collection
          </Link>
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <StatusIcon ok={status === 'caught'} label="Caught" />
        <StatusIcon ok={flags.shiny} label="Shiny" />
        <StatusIcon ok={flags.lucky} label="Lucky" />
        <StatusIcon ok={flags.hundo} label="Hundo" />
        <StatusIcon ok={flags.shadow} label="Shadow" />
        <StatusIcon ok={flags.purified} label="Purified" />
      </div>

      <div>
        <h3 className="font-medium text-sm mb-2">Forms</h3>
        <ul className="space-y-1">
          {speciesRows.map((f) => (
            <li key={f.entry.key} className="flex items-center justify-between text-sm">
              <span>
                {f.entry.formName}
                {f.entry.isCostume ? ' (Costume)' : ''}
                {f.entry.isRegional ? ' (Regional)' : ''}
              </span>
              <StatusIcon ok={f.status === 'caught'} label="Owned" />
            </li>
          ))}
        </ul>
      </div>

      {family && (
        <div>
          <h3 className="font-medium text-sm mb-2">Evolution</h3>
          <ProgressBar value={family.ownedCount} max={family.totalCount} className="mb-2" />
          <ul className="space-y-1">
            {family.members.map((m) => (
              <li key={m.entry.key} className="flex items-center justify-between text-sm">
                <span>{m.entry.name}</span>
                <StatusIcon ok={m.owned} label="Owned" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-medium text-sm mb-1">Mega</h3>
        <p className="text-sm text-foreground/70">
          {entry.hasTempEvolutions
            ? flags.mega
              ? '✓ Mega / temp evolution recorded'
              : 'Available in Pokémon GO — not marked yet'
            : 'None'}
        </p>
        {entry.hasGmax && (
          <p className="text-sm text-foreground/70 mt-1">
            {flags.gigantamax ? '✓ Gigantamax recorded' : 'Gigantamax available — not marked yet'}
          </p>
        )}
      </div>
    </section>
  );
}
