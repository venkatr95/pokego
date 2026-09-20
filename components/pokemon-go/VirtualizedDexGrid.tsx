'use client';

import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { AggregatedDexRow } from '@/types/pokemon-go';
import { PokedexCard } from './PokedexCard';
import { useWindowWidth } from '@/lib/pokemon-go/use-window-width';

function columnsForWidth(width: number): number {
  if (width >= 1280) return 6;
  if (width >= 1024) return 5;
  if (width >= 768) return 4;
  if (width >= 640) return 3;
  return 2;
}

export function VirtualizedDexGrid({
  rows,
  estimateRowHeight = 280,
}: {
  rows: AggregatedDexRow[];
  estimateRowHeight?: number;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const width = useWindowWidth();
  const columns = columnsForWidth(width);

  const rowCount = Math.ceil(rows.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 4,
  });

  const items = virtualizer.getVirtualItems();

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    }),
    [columns]
  );

  if (rows.length === 0) {
    return <p className="text-sm text-foreground/50">No Pokémon match these filters.</p>;
  }

  return (
    <div
      ref={parentRef}
      className="h-[min(70vh,900px)] overflow-auto rounded-xl border border-border"
      role="list"
      aria-label="Pokémon list"
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {items.map((virtualRow) => {
          const start = virtualRow.index * columns;
          const slice = rows.slice(start, start + columns);
          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 w-full px-1"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid gap-3 py-1.5" style={gridStyle}>
                {slice.map((row) => (
                  <div key={row.entry.key} role="listitem">
                    <PokedexCard row={row} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
