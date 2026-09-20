'use client';

import { useEffect } from 'react';
import { LoginButton } from '@/components/auth/LoginButton';
import { createClient } from '@/lib/supabase/client';
import { usePokemonGoCollectionStore } from '@/store/pokemon-go-collection-store';

export function CloudSyncPanel() {
  const syncState = usePokemonGoCollectionStore((s) => s.syncState);
  const syncError = usePokemonGoCollectionStore((s) => s.syncError);
  const syncOptIn = usePokemonGoCollectionStore((s) => s.syncOptIn);
  const lastSyncedAt = usePokemonGoCollectionStore((s) => s.lastSyncedAt);
  const cloudUserId = usePokemonGoCollectionStore((s) => s.cloudUserId);
  const collection = usePokemonGoCollectionStore((s) => s.collection);
  const enableSync = usePokemonGoCollectionStore((s) => s.enableSync);
  const disableSync = usePokemonGoCollectionStore((s) => s.disableSync);
  const syncNow = usePokemonGoCollectionStore((s) => s.syncNow);
  const bindAuthUser = usePokemonGoCollectionStore((s) => s.bindAuthUser);

  const supabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    if (!supabaseConfigured) return;
    try {
      const supabase = createClient();
      void supabase.auth.getUser().then(({ data }) => {
        void bindAuthUser(data.user?.id ?? null);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        void bindAuthUser(session?.user?.id ?? null);
      });
      return () => sub.subscription.unsubscribe();
    } catch {
      return undefined;
    }
  }, [bindAuthUser, supabaseConfigured]);

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-lg">Cloud sync</h2>
        <p className="text-sm text-foreground/60 mt-1">
          Optionally sync your collection to your PokéYou account (structured rows with
          row-level security). Local IndexedDB remains the offline cache. We never store
          Pokémon GO passwords.
        </p>
      </div>

      {!supabaseConfigured ? (
        <p className="text-sm text-amber-300/90">
          Cloud sync requires Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL` and
          `NEXT_PUBLIC_SUPABASE_ANON_KEY`) plus the `go_collections` migration.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <LoginButton />
          {cloudUserId ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">Signed in</span>
          ) : (
            <span className="text-xs text-foreground/50">Sign in required to sync</span>
          )}
        </div>
      )}

      {!syncOptIn ? (
        <div className="space-y-3">
          <p className="text-sm text-foreground/70">
            Sync is off. Enable it to upload this device&apos;s collection and pull updates
            on other devices.
          </p>
          <button
            type="button"
            disabled={!supabaseConfigured || !cloudUserId || !collection}
            onClick={() => void enableSync()}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-40"
          >
            Enable cloud sync
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!cloudUserId || syncState === 'syncing'}
            onClick={() => void syncNow()}
            className="btn-primary text-sm py-2 px-4 disabled:opacity-40"
          >
            {syncState === 'syncing' ? 'Syncing…' : 'Sync now'}
          </button>
          <button
            type="button"
            onClick={() => void disableSync()}
            className="glass rounded-lg text-sm py-2 px-4"
          >
            Pause sync
          </button>
        </div>
      )}

      <div className="text-xs text-foreground/50 space-y-1">
        <p>
          Status:{' '}
          <strong className="text-foreground/80">
            {syncState === 'needs_opt_in'
              ? 'Not enabled'
              : syncState === 'paused'
                ? 'Paused'
                : syncState === 'syncing'
                  ? 'Syncing'
                  : syncState === 'error'
                    ? 'Error'
                    : 'Ready'}
          </strong>
        </p>
        {lastSyncedAt && <p>Last synced: {new Date(lastSyncedAt).toLocaleString()}</p>}
        {syncError && (
          <p className="text-red-400" role="alert">
            {syncError}
          </p>
        )}
      </div>
    </div>
  );
}
