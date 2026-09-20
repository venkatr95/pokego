'use client';

import { Suspense } from 'react';
import { ImportExportPanel } from '@/components/pokemon-go/ImportExportPanel';
import { ConnectCollectionPanel } from '@/components/pokemon-go/ConnectCollectionPanel';
import { CloudSyncPanel } from '@/components/pokemon-go/CloudSyncPanel';
import { PrivacyBanner } from '@/components/pokemon-go/PrivacyBanner';
import { useCollectorHydration } from '@/lib/pokemon-go/use-collector-data';
import { usePokemonGoCollectionStore } from '@/store/pokemon-go-collection-store';
import { ErrorState } from '@/components/pokemon-go/ErrorState';

export default function CollectionPage() {
  return (
    <Suspense fallback={<p className="text-foreground/60">Loading collection…</p>}>
      <CollectionPageInner />
    </Suspense>
  );
}

function CollectionPageInner() {
  const { loadState } = useCollectorHydration();
  const error = usePokemonGoCollectionStore((s) => s.error);
  const hydrate = usePokemonGoCollectionStore((s) => s.hydrate);
  const collection = usePokemonGoCollectionStore((s) => s.collection);

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Collection</h1>
        <p className="text-sm text-foreground/60 mt-2">
          Connect, sync, and export your Pokémon GO collection. Local storage is always
          available; cloud sync is optional and requires a PokéYou sign-in.
        </p>
      </header>

      <PrivacyBanner />

      {loadState === 'error' && (
        <ErrorState
          title="We couldn't read your collection"
          message="Your existing tracker data is safe."
          onRetry={() => void hydrate()}
        />
      )}

      {loadState === 'loading' && <p className="text-foreground/60">Loading local collection…</p>}

      <ConnectCollectionPanel />
      <CloudSyncPanel />
      <ImportExportPanel />

      {collection && (
        <div className="glass rounded-xl p-4 text-sm text-foreground/70">
          Tip: after connecting, open <strong>Goals</strong> for prioritized next steps, or{' '}
          <strong>Pokédex</strong> to browse completion.
        </div>
      )}
    </div>
  );
}
