'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DexFilter } from '@/types/pokemon-go';

interface PokemonGoSettingsState {
  filter: DexFilter;
  search: string;
  generation: string | null;
  type: string | null;
  showCompletedFamilies: boolean;
  evolutionView: 'all' | 'unevolved' | 'ready' | 'missing';
  setFilter: (filter: DexFilter) => void;
  setSearch: (search: string) => void;
  setGeneration: (generation: string | null) => void;
  setType: (type: string | null) => void;
  setShowCompletedFamilies: (show: boolean) => void;
  setEvolutionView: (view: PokemonGoSettingsState['evolutionView']) => void;
  resetFilters: () => void;
}

export const usePokemonGoSettingsStore = create<PokemonGoSettingsState>()(
  persist(
    (set) => ({
      filter: 'all',
      search: '',
      generation: null,
      type: null,
      showCompletedFamilies: false,
      evolutionView: 'unevolved',

      setFilter: (filter) => set({ filter }),
      setSearch: (search) => set({ search }),
      setGeneration: (generation) => set({ generation }),
      setType: (type) => set({ type }),
      setShowCompletedFamilies: (showCompletedFamilies) => set({ showCompletedFamilies }),
      setEvolutionView: (evolutionView) => set({ evolutionView }),
      resetFilters: () =>
        set({
          filter: 'all',
          search: '',
          generation: null,
          type: null,
        }),
    }),
    {
      name: 'pokeyou-go-settings',
      partialize: (s) => ({
        filter: s.filter,
        generation: s.generation,
        type: s.type,
        showCompletedFamilies: s.showCompletedFamilies,
        evolutionView: s.evolutionView,
      }),
    }
  )
);
