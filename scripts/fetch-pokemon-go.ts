#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// Sync Pokémon GO master data from WatWowMap pogo-data-api
// Run: npx tsx scripts/fetch-pokemon-go.ts
// ============================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'data', 'pokemon-go');

// Pin to main tip at sync time; recorded in manifest
const BASE =
  'https://raw.githubusercontent.com/WatWowMap/pogo-data-api/refs/heads/main/data/v1';

const TYPE_ID_TO_NAME: Record<number, string> = {
  0: 'none',
  1: 'normal',
  2: 'fighting',
  3: 'flying',
  4: 'poison',
  5: 'ground',
  6: 'rock',
  7: 'bug',
  8: 'ghost',
  9: 'steel',
  10: 'fire',
  11: 'water',
  12: 'grass',
  13: 'electric',
  14: 'psychic',
  15: 'ice',
  16: 'dragon',
  17: 'dark',
  18: 'fairy',
};

const REGIONAL_FORM_HINTS = [
  'alola',
  'galar',
  'hisui',
  'paldea',
  'galarian',
  'alolan',
  'hisuian',
  'paldean',
];

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function mapTypes(typeIds: number[] | undefined): { typeIds: number[]; types: string[] } {
  const ids = (typeIds ?? []).filter((t) => t > 0);
  return {
    typeIds: ids,
    types: ids.map((id) => TYPE_ID_TO_NAME[id] ?? `type_${id}`),
  };
}

function isRegionalForm(formName: string | undefined, proto: string | undefined): boolean {
  const hay = `${formName ?? ''} ${proto ?? ''}`.toLowerCase();
  return REGIONAL_FORM_HINTS.some((h) => hay.includes(h));
}

function displayName(speciesName: string, formName: string | undefined, isDefault: boolean): string {
  if (!formName || isDefault || formName.toLowerCase() === 'normal') return speciesName;
  return `${speciesName} (${formName})`;
}

async function main() {
  console.log('Fetching WatWowMap Pokémon GO master data…');
  ensureDir(OUT_DIR);

  const [pokemon, forms, costumes, types] = await Promise.all([
    fetchJson<any[]>(`${BASE}/pokemon.json`),
    fetchJson<any[]>(`${BASE}/forms.json`),
    fetchJson<any[]>(`${BASE}/costumes.json`),
    fetchJson<any[]>(`${BASE}/types.json`),
  ]);

  console.log(`Loaded ${pokemon.length} pokemon, ${forms.length} forms, ${costumes.length} costumes`);

  const formById = new Map<number, any>();
  for (const f of forms) {
    if (f?.formId != null) formById.set(f.formId, f);
  }

  const slimPokemon = pokemon.map((p) => ({
    pokedexId: p.pokedexId,
    pokemonName: p.pokemonName,
    defaultFormId: p.defaultFormId,
    forms: p.forms ?? [],
    types: p.types ?? [],
    genId: p.genId,
    generation: p.generation,
    family: p.family ?? p.pokedexId,
    legendary: !!p.legendary,
    mythic: !!p.mythic,
    attack: p.attack,
    defense: p.defense,
    stamina: p.stamina,
    evolutions: (p.evolutions ?? []).map((e: any) => ({
      evoId: e.evoId,
      formId: e.formId,
      candyCost: e.candyCost,
      itemRequirement: e.itemRequirement,
      mustBeBuddy: e.mustBeBuddy,
      onlyDaytime: e.onlyDaytime,
      onlyNighttime: e.onlyNighttime,
      questRequirement: e.questRequirement,
      genderRequirement: e.genderRequirement,
      tradeBonus: e.tradeBonus,
    })),
    tempEvolutions: p.tempEvolutions ?? [],
    gmaxMove: p.gmaxMove,
  }));

  const slimForms = forms.map((f) => ({
    formId: f.formId,
    formName: f.formName,
    proto: f.proto,
    isCostume: !!f.isCostume,
    types: f.types,
    attack: f.attack,
    defense: f.defense,
    stamina: f.stamina,
    evolutions: f.evolutions,
    tempEvolutions: f.tempEvolutions,
    gmaxMove: f.gmaxMove,
    family: f.family,
  }));

  const slimCostumes = costumes.map((c) => ({
    id: c.id,
    name: c.name,
    proto: c.proto,
    noEvolve: !!c.noEvolve,
  }));

  const slimTypes = (types ?? []).map((t: any) => ({
    typeId: t.typeId ?? t.id,
    typeName: (t.typeName ?? t.name ?? '').toLowerCase(),
  }));

  // Build collector index: one row per species+form that appears on a species
  const entries: any[] = [];
  for (const p of slimPokemon) {
    const formIds: number[] = Array.isArray(p.forms) && p.forms.length > 0
      ? p.forms
      : [p.defaultFormId].filter((x: number) => x != null);

    const uniqueFormIds = [...new Set(formIds)];

    for (const formId of uniqueFormIds) {
      const form = formById.get(formId) ?? {};
      const isDefault = formId === p.defaultFormId;
      const isCostume = !!form.isCostume;
      const formName = form.formName ?? (isDefault ? 'Normal' : `Form ${formId}`);
      const typeMapped = mapTypes(form.types ?? p.types);
      const evolutions = (form.evolutions ?? p.evolutions ?? []).map((e: any) => ({
        evoId: e.evoId,
        formId: e.formId,
        candyCost: e.candyCost,
        itemRequirement: e.itemRequirement,
        mustBeBuddy: e.mustBeBuddy,
        onlyDaytime: e.onlyDaytime,
        onlyNighttime: e.onlyNighttime,
        questRequirement: e.questRequirement,
        genderRequirement: e.genderRequirement,
        tradeBonus: e.tradeBonus,
      }));

      entries.push({
        key: `${p.pokedexId}:${formId}`,
        speciesId: p.pokedexId,
        formId,
        name: p.pokemonName,
        formName,
        displayName: displayName(p.pokemonName, formName, isDefault),
        isDefault,
        isCostume,
        isRegional: isRegionalForm(formName, form.proto),
        types: typeMapped.types,
        typeIds: typeMapped.typeIds,
        generation: p.generation ?? 'Unknown',
        genId: p.genId ?? 0,
        family: form.family ?? p.family ?? p.pokedexId,
        legendary: !!p.legendary,
        mythic: !!p.mythic,
        evolutions,
        hasTempEvolutions: !!(form.tempEvolutions?.length || p.tempEvolutions?.length),
        hasGmax: !!(form.gmaxMove || p.gmaxMove),
        attack: form.attack ?? p.attack ?? 0,
        defense: form.defense ?? p.defense ?? 0,
        stamina: form.stamina ?? p.stamina ?? 0,
      });
    }
  }

  // Prefer default (non-costume) entries first in the index
  entries.sort((a, b) => a.speciesId - b.speciesId || Number(b.isDefault) - Number(a.isDefault) || a.formId - b.formId);

  const manifest = {
    source: BASE,
    syncedAt: new Date().toISOString(),
    pokemonCount: slimPokemon.length,
    formCount: slimForms.length,
    costumeCount: slimCostumes.length,
    entryCount: entries.length,
  };

  fs.writeFileSync(path.join(OUT_DIR, 'pokemon.json'), JSON.stringify(slimPokemon));
  fs.writeFileSync(path.join(OUT_DIR, 'forms.json'), JSON.stringify(slimForms));
  fs.writeFileSync(path.join(OUT_DIR, 'costumes.json'), JSON.stringify(slimCostumes));
  fs.writeFileSync(path.join(OUT_DIR, 'types.json'), JSON.stringify(slimTypes));
  fs.writeFileSync(path.join(OUT_DIR, 'collector-index.json'), JSON.stringify(entries));
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`Wrote collector-index with ${entries.length} entries → ${OUT_DIR}`);
  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
