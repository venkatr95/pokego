'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PokemonGoCollection, PokemonGoInstance } from '@/types/pokemon-go';
import {
  clearCollection,
  createEmptyCollection,
  loadCollection,
  saveCollection,
} from '@/lib/pokemon-go/collection-db';
import {
  importFromCompanionJson,
  importFromFile,
  OfficialProvider,
} from '@/lib/pokemon-go/provider';
import { resolveHundo } from '@/lib/pokemon-go/hundo';
import { makeDexKey } from '@/types/pokemon-go';
import {
  mergeCollections,
  pullCollection,
  pushCollection,
  setSyncEnabled as setCloudSyncEnabled,
  type GoCollectionSource,
} from '@/lib/pokemon-go/cloud-sync';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/analytics';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SyncState = 'idle' | 'syncing' | 'error' | 'paused' | 'needs_opt_in';

interface PokemonGoCollectionState {
  collection: PokemonGoCollection | null;
  loadState: LoadState;
  error: string | null;
  hasHydrated: boolean;

  // Cloud sync
  syncState: SyncState;
  syncError: string | null;
  syncOptIn: boolean;
  lastSyncedAt: string | null;
  cloudUserId: string | null;
  lastSource: GoCollectionSource | null;

  hydrate: () => Promise<void>;
  setCollection: (
    collection: PokemonGoCollection,
    options?: { source?: GoCollectionSource; skipPush?: boolean }
  ) => Promise<void>;
  importFile: (file: File) => Promise<void>;
  importCompanionJson: (text: string) => Promise<void>;
  connectOfficial: () => Promise<void>;
  clear: () => Promise<void>;
  upsertInstance: (instance: PokemonGoInstance) => Promise<void>;
  toggleFlag: (
    speciesId: number,
    formId: number,
    flag: keyof Pick<
      PokemonGoInstance,
      | 'caught'
      | 'seen'
      | 'shiny'
      | 'shadow'
      | 'purified'
      | 'lucky'
      | 'hundo'
      | 'mega'
      | 'primal'
      | 'dynamax'
      | 'gigantamax'
    >
  ) => Promise<void>;

  setSyncOptIn: (optIn: boolean) => void;
  enableSync: () => Promise<void>;
  disableSync: () => Promise<void>;
  syncNow: () => Promise<void>;
  bindAuthUser: (userId: string | null) => Promise<void>;
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePush(get: () => PokemonGoCollectionState) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void get().syncNow();
  }, 1000);
}

export const usePokemonGoCollectionStore = create<PokemonGoCollectionState>()(
  persist(
    (set, get) => ({
      collection: null,
      loadState: 'idle',
      error: null,
      hasHydrated: false,

      syncState: 'needs_opt_in',
      syncError: null,
      syncOptIn: false,
      lastSyncedAt: null,
      cloudUserId: null,
      lastSource: null,

      hydrate: async () => {
        if (get().hasHydrated && get().loadState === 'ready') return;
        set({ loadState: 'loading', error: null });
        try {
          const collection = await loadCollection();
          set({ collection, loadState: 'ready', hasHydrated: true, error: null });
        } catch {
          set({
            collection: null,
            loadState: 'error',
            hasHydrated: true,
            error: "We couldn't read your collection. Your existing tracker data is safe.",
          });
        }
      },

      setCollection: async (collection, options) => {
        const normalized: PokemonGoCollection = {
          ...collection,
          pokemon: collection.pokemon.map((p) => ({
            ...p,
            hundo: resolveHundo(p),
          })),
          updatedAt: new Date().toISOString(),
        };
        await saveCollection(normalized);
        set({
          collection: normalized,
          loadState: 'ready',
          error: null,
          hasHydrated: true,
          lastSource: options?.source ?? get().lastSource,
        });
        if (!options?.skipPush && get().syncOptIn && get().cloudUserId) {
          schedulePush(get);
        }
      },

      importFile: async (file) => {
        set({ loadState: 'loading', error: null });
        try {
          const collection = await importFromFile(file);
          await get().setCollection(collection, { source: 'import' });
          track('collection_import', {
            format: file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json',
          });
        } catch (e) {
          set({
            loadState: 'error',
            error: e instanceof Error ? e.message : "We couldn't read your collection.",
          });
          throw e;
        }
      },

      importCompanionJson: async (text) => {
        set({ loadState: 'loading', error: null });
        try {
          const collection = await importFromCompanionJson(text);
          await get().setCollection(collection, { source: 'companion' });
          track('companion_import', { format: 'json' });
        } catch (e) {
          set({
            loadState: 'error',
            error: e instanceof Error ? e.message : 'Companion import failed.',
          });
          throw e;
        }
      },

      connectOfficial: async () => {
        set({ loadState: 'loading', error: null });
        try {
          const provider = new OfficialProvider();
          await provider.connect();
          const collection = await provider.getCollection();
          await get().setCollection(collection, { source: 'official' });
        } catch (e) {
          set({
            loadState: 'ready',
            error: e instanceof Error ? e.message : 'Official connection failed.',
          });
          throw e;
        }
      },

      clear: async () => {
        await clearCollection();
        set({ collection: null, loadState: 'ready', error: null });
        if (get().syncOptIn && get().cloudUserId) {
          schedulePush(get);
        }
      },

      upsertInstance: async (instance) => {
        const current = get().collection ?? createEmptyCollection();
        const formId = instance.formId ?? 0;
        const key = makeDexKey(instance.speciesId, formId);
        const pokemon = [...current.pokemon];
        const idx = pokemon.findIndex(
          (p) => makeDexKey(p.speciesId, p.formId ?? 0) === key
        );
        const next = { ...instance, formId, hundo: resolveHundo(instance) };
        if (idx >= 0) pokemon[idx] = { ...pokemon[idx], ...next };
        else pokemon.push(next);
        await get().setCollection({ ...current, pokemon }, { source: 'manual' });
      },

      toggleFlag: async (speciesId, formId, flag) => {
        const current = get().collection ?? createEmptyCollection();
        const key = makeDexKey(speciesId, formId);
        const pokemon = [...current.pokemon];
        const idx = pokemon.findIndex(
          (p) => makeDexKey(p.speciesId, p.formId ?? 0) === key
        );
        const existing = idx >= 0 ? pokemon[idx] : { speciesId, formId };
        const nextVal = !existing[flag];
        const updated: PokemonGoInstance = {
          ...existing,
          speciesId,
          formId,
          [flag]: nextVal,
        };
        if (flag === 'caught' && nextVal) updated.seen = true;
        if (flag === 'hundo') updated.hundo = nextVal;
        else updated.hundo = resolveHundo(updated);

        if (idx >= 0) pokemon[idx] = updated;
        else pokemon.push(updated);
        await get().setCollection({ ...current, pokemon }, { source: 'manual' });
      },

      setSyncOptIn: (optIn) => {
        set({
          syncOptIn: optIn,
          syncState: optIn ? 'idle' : 'needs_opt_in',
        });
      },

      enableSync: async () => {
        set({ syncOptIn: true, syncState: 'idle', syncError: null });
        const userId = get().cloudUserId;
        if (userId) {
          try {
            const supabase = createClient();
            await setCloudSyncEnabled(supabase, userId, true);
          } catch {
            // meta row may not exist yet; syncNow will create it
          }
          await get().syncNow();
        }
      },

      disableSync: async () => {
        set({ syncOptIn: false, syncState: 'paused', syncError: null });
        const userId = get().cloudUserId;
        if (!userId) return;
        try {
          const supabase = createClient();
          await setCloudSyncEnabled(supabase, userId, false);
        } catch (e) {
          set({
            syncError: e instanceof Error ? e.message : 'Failed to pause sync',
          });
        }
      },

      syncNow: async () => {
        const { syncOptIn, cloudUserId, collection } = get();
        if (!syncOptIn) {
          set({ syncState: 'needs_opt_in' });
          return;
        }
        if (!cloudUserId) {
          set({ syncState: 'idle', syncError: 'Sign in to sync your collection.' });
          return;
        }

        set({ syncState: 'syncing', syncError: null });
        try {
          const supabase = createClient();
          const remote = await pullCollection(supabase, cloudUserId);
          if (!remote.syncEnabled) {
            set({ syncState: 'paused', syncOptIn: false });
            return;
          }

          const merged = mergeCollections(collection, remote.collection);
          await saveCollection(merged);
          await pushCollection(supabase, cloudUserId, merged, {
            source: get().lastSource ?? 'manual',
            syncEnabled: true,
          });

          const now = new Date().toISOString();
          set({
            collection: merged,
            syncState: 'idle',
            lastSyncedAt: now,
            syncError: null,
          });
          track('collection_sync', { direction: 'bidirectional', count: merged.pokemon.length });
        } catch (e) {
          set({
            syncState: 'error',
            syncError:
              e instanceof Error
                ? e.message
                : 'Cloud sync failed. Your local collection is still safe.',
          });
        }
      },

      bindAuthUser: async (userId) => {
        const prev = get().cloudUserId;
        set({ cloudUserId: userId });
        if (!userId) {
          set({ syncState: get().syncOptIn ? 'idle' : 'needs_opt_in' });
          return;
        }
        if (userId !== prev && get().syncOptIn) {
          await get().syncNow();
        }
      },
    }),
    {
      name: 'pokeyou-go-sync-prefs',
      partialize: (s) => ({
        syncOptIn: s.syncOptIn,
        lastSyncedAt: s.lastSyncedAt,
        lastSource: s.lastSource,
      }),
    }
  )
);
