// ============================================================
// Collection import / export (JSON + CSV)
// ============================================================

import type { PokemonGoCollection, PokemonGoInstance } from '@/types/pokemon-go';
import { resolveHundo } from './hundo';

const CSV_HEADERS = [
  'speciesId',
  'formId',
  'caught',
  'seen',
  'shiny',
  'shadow',
  'purified',
  'lucky',
  'hundo',
  'male',
  'female',
  'mega',
  'primal',
  'dynamax',
  'gigantamax',
  'candy',
  'cp',
  'ivAttack',
  'ivDefense',
  'ivStamina',
  'costumeId',
] as const;

function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  return false;
}

function num(v: unknown): number | undefined {
  if (v == null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeInstance(raw: Partial<PokemonGoInstance> & Record<string, unknown>): PokemonGoInstance | null {
  const speciesId = num(raw.speciesId);
  if (speciesId == null) return null;

  const ivAttack = num(raw.ivAttack ?? (raw.iv as { attack?: number } | undefined)?.attack);
  const ivDefense = num(raw.ivDefense ?? (raw.iv as { defense?: number } | undefined)?.defense);
  const ivStamina = num(raw.ivStamina ?? (raw.iv as { stamina?: number } | undefined)?.stamina);
  const iv =
    ivAttack != null && ivDefense != null && ivStamina != null
      ? { attack: ivAttack, defense: ivDefense, stamina: ivStamina }
      : raw.iv && typeof raw.iv === 'object'
        ? (raw.iv as PokemonGoInstance['iv'])
        : undefined;

  const hundo = resolveHundo({ hundo: raw.hundo as boolean | undefined, iv });

  let gender: PokemonGoInstance['gender'];
  if (raw.gender === 'male' || raw.gender === 'female' || raw.gender === 'unknown') {
    gender = raw.gender;
  } else if (bool(raw.male)) {
    gender = 'male';
  } else if (bool(raw.female)) {
    gender = 'female';
  }

  return {
    speciesId,
    formId: num(raw.formId) ?? 0,
    seen: bool(raw.seen) || bool(raw.caught),
    caught: bool(raw.caught),
    shiny: bool(raw.shiny),
    shadow: bool(raw.shadow),
    purified: bool(raw.purified),
    lucky: bool(raw.lucky),
    hundo,
    cp: num(raw.cp),
    candy: num(raw.candy),
    iv,
    gender,
    costumeId: num(raw.costumeId),
    mega: bool(raw.mega),
    primal: bool(raw.primal),
    dynamax: bool(raw.dynamax),
    gigantamax: bool(raw.gigantamax),
  };
}

export function parseCollectionJson(text: string): PokemonGoCollection {
  const data = JSON.parse(text) as PokemonGoCollection | PokemonGoInstance[];
  if (Array.isArray(data)) {
    return {
      importedAt: new Date().toISOString(),
      pokemon: data.map((p) => normalizeInstance(p as never)).filter(Boolean) as PokemonGoInstance[],
    };
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.pokemon)) {
    throw new Error('Invalid collection JSON: expected { pokemon: [] } or an array');
  }
  return {
    trainer: data.trainer,
    importedAt: data.importedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pokemon: data.pokemon.map((p) => normalizeInstance(p as never)).filter(Boolean) as PokemonGoInstance[],
  };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseCollectionCsv(text: string): PokemonGoCollection {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row');
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const pokemon: PokemonGoInstance[] = [];

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    const inst = normalizeInstance(row);
    if (inst) pokemon.push(inst);
  }

  return {
    importedAt: new Date().toISOString(),
    pokemon,
  };
}

export function exportCollectionJson(collection: PokemonGoCollection): string {
  return JSON.stringify(collection, null, 2);
}

export function exportCollectionCsv(collection: PokemonGoCollection): string {
  const rows = [CSV_HEADERS.join(',')];
  for (const p of collection.pokemon) {
    const vals = [
      p.speciesId,
      p.formId ?? 0,
      !!p.caught,
      !!p.seen || !!p.caught,
      !!p.shiny,
      !!p.shadow,
      !!p.purified,
      !!p.lucky,
      resolveHundo(p),
      p.gender === 'male',
      p.gender === 'female',
      !!p.mega,
      !!p.primal,
      !!p.dynamax,
      !!p.gigantamax,
      p.candy ?? '',
      p.cp ?? '',
      p.iv?.attack ?? '',
      p.iv?.defense ?? '',
      p.iv?.stamina ?? '',
      p.costumeId ?? '',
    ];
    rows.push(vals.join(','));
  }
  return rows.join('\n');
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
