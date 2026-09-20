'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { AggregatedDexRow } from '@/types/pokemon-go';
import { formatDexNumber, spriteUrl } from '@/lib/pokemon-go/format';
import { StatusIcon } from './StatusIcon';
import { ProgressBar } from './ProgressBar';

export function PokedexCard({ row }: { row: AggregatedDexRow }) {
  const { entry, status, flags, evolutionProgress } = row;
  const caught = status === 'caught';

  return (
    <article className="glass-card rounded-xl p-3 flex flex-col gap-2 content-visibility-auto">
      <div className="flex items-start gap-3">
        <div className="relative w-14 h-14 shrink-0 rounded-lg bg-muted overflow-hidden">
          <Image
            src={spriteUrl(entry.speciesId)}
            alt=""
            width={56}
            height={56}
            className="object-contain w-full h-full"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-foreground/50 font-mono">
            {formatDexNumber(entry.speciesId)}
          </p>
          <h3 className="font-medium text-sm truncate" title={entry.displayName}>
            {entry.displayName}
          </h3>
          <p className="text-[11px] text-foreground/50 capitalize">
            {entry.types.join(' · ') || '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <StatusIcon ok={caught} label="Caught" />
        <StatusIcon ok={flags.shiny} label="Shiny" />
        <StatusIcon ok={flags.shadow} label="Shadow" />
        <StatusIcon ok={flags.lucky} label="Lucky" />
        <StatusIcon ok={flags.hundo} label="Hundo" />
        <StatusIcon ok={status === 'seen'} label="Seen" />
      </div>

      {evolutionProgress.total > 1 && (
        <ProgressBar
          value={evolutionProgress.owned}
          max={evolutionProgress.total}
          label={`Evolution ${evolutionProgress.owned} / ${evolutionProgress.total}`}
        />
      )}

      <div className="mt-auto grid grid-cols-2 gap-2">
        <Link
          href={`/pokemon-go/pokedex/${encodeURIComponent(entry.key)}`}
          className="text-center text-xs py-2 rounded-lg glass hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          GO Details
        </Link>
        <Link
          href={`/pokemon/${entry.speciesId}`}
          className="text-center text-xs py-2 rounded-lg glass hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Species
        </Link>
      </div>
    </article>
  );
}
