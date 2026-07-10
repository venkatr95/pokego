import React from 'react';

type AdUnitProps = {
  slotId: string;
  width: number;
  height: number;
  className?: string;
};

export function AdUnit({ slotId, width, height, className = '' }: AdUnitProps) {
  return (
    <div
      className={`ad-container bg-foreground/5 flex items-center justify-center border border-dashed border-foreground/10 text-foreground/40 text-xs font-mono rounded-xl ${className}`}
      style={{
        minWidth: width,
        minHeight: height,
        width: '100%',
        maxWidth: width,
      }}
      aria-hidden="true"
    >
      Ad Slot: {slotId} ({width}x{height})
    </div>
  );
}
