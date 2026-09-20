'use client';

import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  max,
  label,
  className,
}: {
  value: number;
  max: number;
  label?: string;
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex justify-between text-sm text-foreground/70">
          <span>{label}</span>
          <span>
            {value.toLocaleString()} / {max.toLocaleString()} · {pct.toFixed(1)}%
          </span>
        </div>
      )}
      <div
        className="h-2.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
