import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  makeDexKey,
  mergeCollections,
  parseCollectionCsv,
  parseCollectionJson,
  pullCollection,
  pushCollection,
  resolveHundo,
  setSyncEnabled as setCloudSyncEnabled,
  type GoCollectionSource,
  type PokemonGoCollection,
  type PokemonGoInstance,
} from '@pokeyou/pokemon-go-core';
import {
  clearCollection,
  createEmptyCollection,
  loadCollection,
  saveCollection,
} from '../lib/collection-storage';
import { supabase } from '../lib/supabase';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';
type SyncState = 'idle' | 'syncing' | 'error' | 'paused' | 'needs_opt_in';

interface State {
  collection: PokemonGoCollection | null;
  loadState: LoadState;
  error: string | null;
  hasHydrated: boolean;
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
  importText: (text: string, kind: 'json' | 'csv') => Promise<void>;
  clear: () => Promise<void>;
  toggleFlag: (
    speciesId: number,
    formId: number,
    flag: keyof Pick<
      PokemonGoInstance,
      'caught' | 'seen' | 'shiny' | 'shadow' | 'purified' | 'lucky' | 'hundo'
    >
  ) => Promise<void>;
  setSyncOptIn: (v: boolean) => void;
  enableSync: () => Promise<void>;
  disableSync: () => Promise<void>;
  syncNow: () => Promise<void>;
  bindAuthUser: (userId: string | null) => Promise<void>;
}

let pushTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePush(get: () => State) {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void get().syncNow();
  }, 1000);
}

export const useCollectionStore = create<State>()(
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
            error: "Couldn't read local collection.",
          });
        }
      },

      setCollection: async (collection, options) => {
        const normalized: PokemonGoCollection = {
          ...collection,
          pokemon: collection.pokemon.map((p) => ({ ...p, hundo: resolveHundo(p) })),
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

      importText: async (text, kind) => {
        set({ loadState: 'loading', error: null });
        try {
          const collection =
            kind === 'csv' ? parseCollectionCsv(text) : parseCollectionJson(text);
          await get().setCollection(collection, {
            source: kind === 'json' ? 'companion' : 'import',
          });
        } catch (e) {
          set({
            loadState: 'error',
            error: e instanceof Error ? e.message : 'Import failed',
          });
          throw e;
        }
      },

      clear: async () => {
        await clearCollection();
        set({ collection: null, loadState: 'ready', error: null });
        if (get().syncOptIn && get().cloudUserId) schedulePush(get);
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
        updated.hundo =
          flag === 'hundo' ? nextVal : resolveHundo(updated);
        if (idx >= 0) pokemon[idx] = updated;
        else pokemon.push(updated);
        await get().setCollection({ ...current, pokemon }, { source: 'manual' });
      },

      setSyncOptIn: (syncOptIn) =>
        set({ syncOptIn, syncState: syncOptIn ? 'idle' : 'needs_opt_in' }),

      enableSync: async () => {
        set({ syncOptIn: true, syncState: 'idle', syncError: null });
        const userId = get().cloudUserId;
        if (userId && supabase) {
          try {
            await setCloudSyncEnabled(supabase, userId, true);
          } catch {
            // meta may not exist yet
          }
          await get().syncNow();
        }
      },

      disableSync: async () => {
        set({ syncOptIn: false, syncState: 'paused', syncError: null });
        const userId = get().cloudUserId;
        if (!userId || !supabase) return;
        try {
          await setCloudSyncEnabled(supabase, userId, false);
        } catch (e) {
          set({ syncError: e instanceof Error ? e.message : 'Pause failed' });
        }
      },

      syncNow: async () => {
        const { syncOptIn, cloudUserId, collection } = get();
        if (!syncOptIn) {
          set({ syncState: 'needs_opt_in' });
          return;
        }
        if (!cloudUserId || !supabase) {
          set({ syncState: 'idle', syncError: 'Sign in to sync.' });
          return;
        }
        set({ syncState: 'syncing', syncError: null });
        try {
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
          set({
            collection: merged,
            syncState: 'idle',
            lastSyncedAt: new Date().toISOString(),
            syncError: null,
          });
        } catch (e) {
          set({
            syncState: 'error',
            syncError: e instanceof Error ? e.message : 'Sync failed',
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
        if (userId !== prev && get().syncOptIn) await get().syncNow();
      },
    }),
    {
      name: 'pokeyou-go-mobile-sync-prefs',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        syncOptIn: s.syncOptIn,
        lastSyncedAt: s.lastSyncedAt,
        lastSource: s.lastSource,
      }),
    }
  )
);
