'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatusIcon({
  ok,
  label,
  className,
}: {
  ok: boolean;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
        className
      )}
      aria-label={`${label}: ${ok ? 'yes' : 'no'}`}
    >
      {ok ? <Check className="w-3.5 h-3.5" aria-hidden /> : <X className="w-3.5 h-3.5" aria-hidden />}
      <span>{label}</span>
    </span>
  );
}
