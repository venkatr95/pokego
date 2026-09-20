'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAggregatedDex, useFamilies } from '@/lib/pokemon-go/use-collector-data';
import { formatDexNumber, spriteUrl } from '@/lib/pokemon-go/format';
import { StatusIcon } from '@/components/pokemon-go/StatusIcon';
import { ProgressBar } from '@/components/pokemon-go/ProgressBar';
import { usePokemonGoCollectionStore } from '@/store/pokemon-go-collection-store';
import { parseDexKey } from '@/types/pokemon-go';
import { track } from '@/lib/analytics';

export default function PokemonGoDetailPage() {
  const params = useParams<{ key: string }>();
  const key = decodeURIComponent(params.key);
  const { rows, loading } = useAggregatedDex(false);
  const { families } = useFamilies();
  const toggleFlag = usePokemonGoCollectionStore((s) => s.toggleFlag);

  useEffect(() => {
    track('pokemon_detail_open', { key, surface: 'go_detail' });
  }, [key]);

  const row = useMemo(() => rows.find((r) => r.entry.key === key), [rows, key]);
  const speciesForms = useMemo(() => {
    if (!row) return [];
    return rows.filter((r) => r.entry.speciesId === row.entry.speciesId);
  }, [rows, row]);

  const family = useMemo(
    () => (row ? families.find((f) => f.familyId === row.entry.family) : undefined),
    [families, row]
  );

  if (loading) return <p className="text-foreground/60">Loading…</p>;
  if (!row) {
    return (
      <div className="space-y-3">
        <p>Pokémon not found.</p>
        <Link href="/pokemon-go/pokedex" className="text-brand-600 dark:text-brand-400 underline text-sm">
          Back to Pokédex
        </Link>
      </div>
    );
  }

  const { entry, flags, status } = row;
  const parsed = parseDexKey(entry.key);

  const toggles = [
    ['caught', 'Caught'],
    ['seen', 'Seen'],
    ['shiny', 'Shiny'],
    ['shadow', 'Shadow'],
    ['purified', 'Purified'],
    ['lucky', 'Lucky'],
    ['hundo', 'Hundo'],
    ['mega', 'Mega'],
    ['primal', 'Primal'],
    ['dynamax', 'Dynamax'],
    ['gigantamax', 'Gigantamax'],
  ] as const;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/pokemon-go/pokedex"
          className="text-foreground/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          ← Back to Pokédex
        </Link>
        <Link
          href={`/pokemon/${entry.speciesId}`}
          className="text-brand-600 dark:text-brand-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
        >
          Species page
        </Link>
      </div>

      <header className="flex gap-4 items-start">
        <div className="relative w-24 h-24 rounded-xl bg-muted overflow-hidden shrink-0">
          <Image
            src={spriteUrl(entry.speciesId)}
            alt=""
            width={96}
            height={96}
            className="object-contain"
            unoptimized
          />
        </div>
        <div>
          <p className="font-mono text-foreground/50">{formatDexNumber(entry.speciesId)}</p>
          <h1 className="text-2xl font-display font-bold">{entry.displayName}</h1>
          <p className="text-sm text-foreground/60 capitalize">
            {entry.types.join(' · ')} · {entry.generation}
          </p>
          <p className="text-sm mt-1">
            Status:{' '}
            <strong>
              {status === 'caught' ? 'Caught' : status === 'seen' ? 'Seen' : 'Not seen'}
            </strong>
          </p>
        </div>
      </header>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold">Your Collection</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <StatusIcon ok={status === 'caught'} label="Caught" />
          <StatusIcon ok={flags.shiny} label="Shiny" />
          <StatusIcon ok={flags.lucky} label="Lucky" />
          <StatusIcon ok={flags.hundo} label="Hundo" />
          <StatusIcon ok={flags.shadow} label="Shadow" />
          <StatusIcon ok={flags.purified} label="Purified" />
          <StatusIcon ok={flags.mega} label="Mega" />
          <StatusIcon ok={flags.dynamax} label="Dynamax" />
          <StatusIcon ok={flags.gigantamax} label="Gigantamax" />
        </div>
        {parsed && (
          <div className="flex flex-wrap gap-2 pt-2">
            {toggles.map(([flag, label]) => (
              <button
                key={flag}
                type="button"
                onClick={() => void toggleFlag(parsed.speciesId, parsed.formId, flag)}
                className="glass rounded-full px-3 py-1 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Toggle {label}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold">Forms</h2>
        <ul className="space-y-2">
          {speciesForms.map((f) => (
            <li key={f.entry.key} className="flex items-center justify-between text-sm">
              <Link
                href={`/pokemon-go/pokedex/${encodeURIComponent(f.entry.key)}`}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
              >
                {f.entry.formName}
                {f.entry.isCostume ? ' (Costume)' : ''}
                {f.entry.isRegional ? ' (Regional)' : ''}
              </Link>
              <StatusIcon ok={f.status === 'caught'} label="Owned" />
            </li>
          ))}
        </ul>
      </section>

      {family && (
        <section className="glass-card rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold">Evolution — {family.name}</h2>
          <ProgressBar value={family.ownedCount} max={family.totalCount} />
          <ul className="space-y-2">
            {family.members.map((m) => (
              <li key={m.entry.key} className="flex items-center justify-between text-sm">
                <span>{m.entry.name}</span>
                <StatusIcon ok={m.owned} label="Owned" />
              </li>
            ))}
          </ul>
          {family.edges.length > 0 && (
            <div className="pt-2 space-y-1 text-sm text-foreground/70">
              {family.edges.map((e) => (
                <p key={`${e.fromKey}-${e.toKey}`}>
                  {e.fromName} → {e.toName}: {e.requirementLabel} ({e.status.replaceAll('_', ' ')})
                </p>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="glass-card rounded-2xl p-5 space-y-2">
        <h2 className="font-semibold">Mega / Max</h2>
        <p className="text-sm text-foreground/70">
          Temp evolutions: {entry.hasTempEvolutions ? 'Available in GO' : 'None'}
        </p>
        <p className="text-sm text-foreground/70">
          Gigantamax: {entry.hasGmax ? 'Available in GO' : 'None'}
        </p>
      </section>
    </div>
  );
}
