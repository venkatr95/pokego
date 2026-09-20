import type { PokemonGoIv } from '@/types/pokemon-go';

/** Derive hundo from IVs when present (15/15/15). */
export function isHundoFromIv(iv?: PokemonGoIv | null): boolean {
  if (!iv) return false;
  return iv.attack === 15 && iv.defense === 15 && iv.stamina === 15;
}

/** Prefer explicit hundo flag; otherwise derive from IVs. */
export function resolveHundo(flags: { hundo?: boolean; iv?: PokemonGoIv | null }): boolean {
  if (flags.hundo === true) return true;
  if (flags.hundo === false && !flags.iv) return false;
  return isHundoFromIv(flags.iv);
}
