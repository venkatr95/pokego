#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// Pokémon Data Fetch Script
// Fetches all Pokémon from PokéAPI and saves to data/pokemon.json
// Run: npx ts-node --esm scripts/fetch-pokemon.ts
//  or: npx tsx scripts/fetch-pokemon.ts
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'pokemon.json');
const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const TOTAL_POKEMON = 1025; // Gen 1-9
const BATCH_SIZE = 50;
const DELAY_MS = 200;

interface RawStat { base_stat: number; effort: number; stat: { name: string } }
interface RawType { slot: number; type: { name: string } }
interface RawAbility { is_hidden: boolean; slot: number; ability: { name: string } }

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

async function fetchPokemon(id: number) {
  const [poke, speciesData] = await Promise.all([
    fetchJson<any>(`${POKEAPI_BASE}/pokemon/${id}`),
    fetchJson<any>(`${POKEAPI_BASE}/pokemon-species/${id}`).catch(() => null),
  ]);

  const types: string[] = poke.types.map((t: RawType) => t.type.name);
  const stats: { name: string; base_stat: number; effort: number }[] = poke.stats.map((s: RawStat) => ({
    name: s.stat.name,
    base_stat: s.base_stat,
    effort: s.effort,
  }));
  const abilities = poke.abilities.map((a: RawAbility) => ({
    name: a.ability.name,
    is_hidden: a.is_hidden,
    slot: a.slot,
  }));

  const baseStatTotal = stats.reduce((sum: number, s: any) => sum + s.base_stat, 0);

  // Get English description
  let description = '';
  let habitat: string | null = null;
  let color = 'blue';
  let generation = 1;
  let isLegendary = false;
  let isMythical = false;

  if (speciesData) {
    const engEntries = speciesData.flavor_text_entries?.filter(
      (e: any) => e.language.name === 'en'
    ) ?? [];
    description = engEntries[0]?.flavor_text?.replace(/\f|\n/g, ' ').trim() ?? '';
    habitat = speciesData.habitat?.name ?? null;
    color = speciesData.color?.name ?? 'blue';
    const genStr: string = speciesData.generation?.name ?? 'generation-i';
    generation = parseInt(genStr.replace('generation-', '').replace(/[ivxl]+$/i, ''), 10) || romanToInt(genStr.split('-')[1] ?? 'i');
    isLegendary = speciesData.is_legendary ?? false;
    isMythical = speciesData.is_mythical ?? false;
  }

  // Determine evolution stage (rough heuristic)
  let evolutionStage = 1;
  if (speciesData?.evolves_from_species) {
    evolutionStage = 2;
    // Check if evolves_from also evolves from something (stage 3)
    try {
      const parentSpecies = await fetchJson<any>(speciesData.evolves_from_species.url);
      if (parentSpecies.evolves_from_species) evolutionStage = 3;
    } catch {
      // ignore
    }
  }

  const displayName = poke.name
    .split('-')
    .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('-');

  return {
    id: poke.id,
    name: poke.name,
    displayName,
    types,
    primaryType: types[0],
    species: speciesData?.genera?.find((g: any) => g.language.name === 'en')?.genus ?? '',
    height: poke.height,
    weight: poke.weight,
    abilities,
    stats,
    sprites: {
      front_default: poke.sprites.front_default,
      front_shiny: poke.sprites.front_shiny,
      official_artwork: poke.sprites.other?.['official-artwork']?.front_default ?? null,
      official_artwork_shiny: poke.sprites.other?.['official-artwork']?.front_shiny ?? null,
    },
    color,
    generation,
    description,
    habitat,
    evolutionStage,
    isLegendary,
    isMythical,
    baseStatTotal,
    weaknesses: [],   // Populated below with type chart data
    resistances: [],
  };
}

// Roman numeral converter for generation parsing
function romanToInt(roman: string): number {
  const map: Record<string, number> = { i: 1, v: 5, x: 10, l: 50 };
  let result = 0;
  for (let i = 0; i < roman.length; i++) {
    const cur = map[roman[i].toLowerCase()] ?? 0;
    const nxt = map[roman[i + 1]?.toLowerCase()] ?? 0;
    result += cur < nxt ? -cur : cur;
  }
  return result || 1;
}

async function main() {
  console.log(`🚀 Fetching ${TOTAL_POKEMON} Pokémon from PokéAPI...`);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  const pokemon: any[] = [];
  let failures = 0;

  for (let batch = 0; batch < Math.ceil(TOTAL_POKEMON / BATCH_SIZE); batch++) {
    const start = batch * BATCH_SIZE + 1;
    const end = Math.min(start + BATCH_SIZE - 1, TOTAL_POKEMON);
    console.log(`📦 Batch ${batch + 1}: Fetching #${start}–${end}...`);

    const results = await Promise.allSettled(
      Array.from({ length: end - start + 1 }, (_, i) => fetchPokemon(start + i))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        pokemon.push(result.value);
      } else {
        failures++;
        console.warn(`⚠️  Failed:`, result.reason?.message ?? result.reason);
      }
    }

    await sleep(DELAY_MS);
  }

  // Sort by ID
  pokemon.sort((a, b) => a.id - b.id);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(pokemon, null, 2), 'utf-8');
  console.log(`\n✅ Saved ${pokemon.length} Pokémon to ${OUTPUT_PATH}`);
  if (failures > 0) console.warn(`⚠️  ${failures} failed to fetch`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
