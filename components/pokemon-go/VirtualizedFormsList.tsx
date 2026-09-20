'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { AggregatedDexRow } from '@/types/pokemon-go';
import { formatDexNumber } from '@/lib/pokemon-go/format';
import { StatusIcon } from './StatusIcon';

export function VirtualizedFormsList({
  groups,
}: {
  groups: Array<[number, AggregatedDexRow[]]>;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: groups.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 6,
  });

  if (groups.length === 0) {
    return <p className="text-sm text-foreground/50">No forms match these filters.</p>;
  }

  return (
    <div
      ref={parentRef}
      className="h-[min(70vh,900px)] overflow-auto rounded-xl border border-border"
      role="list"
      aria-label="Forms by species"
    >
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const [speciesId, forms] = groups[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 w-full px-1 py-1.5"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
              role="listitem"
            >
              <article className="glass-card rounded-xl p-4">
                <h2 className="font-semibold text-sm mb-2">
                  <Link
                    href={`/pokemon/${speciesId}`}
                    className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
                  >
                    {formatDexNumber(speciesId)} {forms[0]?.entry.name}
                  </Link>
                </h2>
                <ul className="space-y-1">
                  {forms.map((f) => (
                    <li key={f.entry.key} className="flex items-center justify-between text-sm">
                      <Link
                        href={`/pokemon-go/pokedex/${encodeURIComponent(f.entry.key)}`}
                        className="hover:underline"
                      >
                        {f.entry.formName}
                        {f.entry.isCostume ? ' · Costume' : ''}
                        {f.entry.isRegional ? ' · Regional' : ''}
                      </Link>
                      <StatusIcon ok={f.status === 'caught'} label="Owned" />
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
}
