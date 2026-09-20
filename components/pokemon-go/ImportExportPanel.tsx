'use client';

import { usePokemonGoCollectionStore } from '@/store/pokemon-go-collection-store';
import {
  downloadText,
  exportCollectionCsv,
  exportCollectionJson,
} from '@/lib/pokemon-go/import-export';
import { track } from '@/lib/analytics';

/** Export / clear controls (import lives in ConnectCollectionPanel). */
export function ImportExportPanel() {
  const collection = usePokemonGoCollectionStore((s) => s.collection);
  const clear = usePokemonGoCollectionStore((s) => s.clear);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-lg">Export &amp; clear</h2>
        <p className="text-sm text-foreground/60 mt-1">
          Download a backup anytime. Clearing only removes local data unless sync is enabled
          (then the next sync updates the cloud copy).
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!collection}
          onClick={() => {
            if (!collection) return;
            downloadText(
              'pokeuu-pokemon-go-collection.json',
              exportCollectionJson(collection),
              'application/json'
            );
            track('collection_export', { format: 'json', count: collection.pokemon.length });
          }}
          className="glass rounded-lg text-sm py-2 px-4 disabled:opacity-40"
        >
          Export JSON
        </button>
        <button
          type="button"
          disabled={!collection}
          onClick={() => {
            if (!collection) return;
            downloadText(
              'pokeuu-pokemon-go-collection.csv',
              exportCollectionCsv(collection),
              'text/csv'
            );
            track('collection_export', { format: 'csv', count: collection.pokemon.length });
          }}
          className="glass rounded-lg text-sm py-2 px-4 disabled:opacity-40"
        >
          Export CSV
        </button>
        <button
          type="button"
          disabled={!collection}
          onClick={() => void clear()}
          className="text-sm py-2 px-4 text-red-400 hover:text-red-300 disabled:opacity-40"
        >
          Clear local collection
        </button>
      </div>

      {collection && (
        <div className="text-sm text-foreground/60 space-y-1">
          <p>
            Records: <strong className="text-foreground">{collection.pokemon.length}</strong>
          </p>
          {collection.trainer?.nickname && (
            <p>
              Trainer nickname:{' '}
              <strong className="text-foreground">{collection.trainer.nickname}</strong>
              <span className="text-foreground/40"> (display only)</span>
            </p>
          )}
          <p>Imported: {new Date(collection.importedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
