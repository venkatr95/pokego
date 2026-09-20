'use client';

import Link from 'next/link';
import { PrivacyBanner } from './PrivacyBanner';

export function EmptyCollection({
  onImportClick,
}: {
  onImportClick?: () => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 space-y-5 max-w-xl">
      <div>
        <h2 className="text-xl font-display font-semibold mb-2">
          Your Pokémon GO collection isn&apos;t connected yet
        </h2>
        <p className="text-foreground/60 text-sm">
          Connect or import your collection to see:
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-foreground/80">
        {[
          'Missing Pokémon',
          'Unevolved Pokémon',
          'Shiny progress',
          'Forms',
          'Hundo progress',
          'Evolution goals',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400" aria-hidden>
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Link href="/pokemon-go/collection" className="btn-primary text-sm py-2 px-4">
          Connect Collection
        </Link>
        <button
          type="button"
          onClick={onImportClick}
          className="glass rounded-lg text-sm py-2 px-4 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Import Collection
        </button>
      </div>
      <PrivacyBanner />
    </div>
  );
}
