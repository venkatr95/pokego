'use client';

import { cn } from '@/lib/utils';
import type { DexFilter } from '@/types/pokemon-go';

const FILTERS: { id: DexFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'missing', label: 'Missing' },
  { id: 'seen', label: 'Seen' },
  { id: 'caught', label: 'Caught' },
  { id: 'unevolved', label: 'Unevolved' },
  { id: 'shiny', label: 'Shiny' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'purified', label: 'Purified' },
  { id: 'lucky', label: 'Lucky' },
  { id: 'hundo', label: 'Hundo' },
  { id: 'mega', label: 'Mega' },
  { id: 'primal', label: 'Primal' },
  { id: 'dynamax', label: 'Dynamax' },
  { id: 'gigantamax', label: 'Gigantamax' },
  { id: 'costumes', label: 'Costumes' },
  { id: 'forms', label: 'Forms' },
  { id: 'regional', label: 'Regional' },
];

export function FilterChips({
  value,
  onChange,
  includeSpecial = true,
}: {
  value: DexFilter;
  onChange: (f: DexFilter) => void;
  includeSpecial?: boolean;
}) {
  const list = includeSpecial
    ? FILTERS
    : FILTERS.filter((f) =>
        ['all', 'missing', 'seen', 'caught', 'unevolved', 'shiny', 'shadow', 'lucky', 'hundo'].includes(
          f.id
        )
      );

  return (
    <div className="flex flex-wrap gap-2" role="listbox" aria-label="Pokédex filters">
      {list.map((f) => {
        const active = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onChange(f.id)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              active
                ? 'bg-brand-500 text-white'
                : 'glass text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
