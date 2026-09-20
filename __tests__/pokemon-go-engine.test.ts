import { resolveHundo, isHundoFromIv } from '../lib/pokemon-go/hundo';
import {
  aggregateFlags,
  buildAggregatedRows,
  completionStats,
  matchesFilter,
  resolveStatus,
  searchRows,
} from '../lib/pokemon-go/engine';
import { parseCollectionCsv, parseCollectionJson, exportCollectionCsv } from '../lib/pokemon-go/import-export';
import { buildEvolutionFamilies, getIncompleteFamilies, getReadyEdges } from '../lib/pokemon-go/evolutions';
import { buildGoalsSummary } from '../lib/pokemon-go/goals';
import type { PogoDexEntry, PokemonGoCollection } from '../types/pokemon-go';

const bulbasaur: PogoDexEntry = {
  key: '1:163',
  speciesId: 1,
  formId: 163,
  name: 'Bulbasaur',
  formName: 'Normal',
  displayName: 'Bulbasaur',
  isDefault: true,
  isCostume: false,
  isRegional: false,
  types: ['grass', 'poison'],
  typeIds: [12, 4],
  generation: 'Kanto',
  genId: 1,
  family: 1,
  legendary: false,
  mythic: false,
  evolutions: [{ evoId: 2, formId: 166, candyCost: 25 }],
  hasTempEvolutions: false,
  hasGmax: false,
  attack: 118,
  defense: 111,
  stamina: 128,
};

const ivysaur: PogoDexEntry = {
  ...bulbasaur,
  key: '2:166',
  speciesId: 2,
  formId: 166,
  name: 'Ivysaur',
  displayName: 'Ivysaur',
  evolutions: [{ evoId: 3, formId: 169, candyCost: 100 }],
};

const venusaur: PogoDexEntry = {
  ...bulbasaur,
  key: '3:169',
  speciesId: 3,
  formId: 169,
  name: 'Venusaur',
  displayName: 'Venusaur',
  evolutions: [],
};

const entries = [bulbasaur, ivysaur, venusaur];

const collection: PokemonGoCollection = {
  importedAt: '2026-01-01T00:00:00.000Z',
  pokemon: [
    { speciesId: 1, formId: 163, caught: true, shiny: true, candy: 84, iv: { attack: 15, defense: 15, stamina: 15 } },
    { speciesId: 2, formId: 166, caught: true, candy: 84 },
  ],
};

describe('hundo', () => {
  test('detects 15/15/15', () => {
    expect(isHundoFromIv({ attack: 15, defense: 15, stamina: 15 })).toBe(true);
    expect(isHundoFromIv({ attack: 14, defense: 15, stamina: 15 })).toBe(false);
  });

  test('resolveHundo prefers explicit flag then IV', () => {
    expect(resolveHundo({ hundo: true })).toBe(true);
    expect(resolveHundo({ iv: { attack: 15, defense: 15, stamina: 15 } })).toBe(true);
  });
});

describe('engine status', () => {
  test('resolveStatus', () => {
    expect(resolveStatus([])).toBe('not_seen');
    expect(resolveStatus([{ speciesId: 1, seen: true }])).toBe('seen');
    expect(resolveStatus([{ speciesId: 1, caught: true }])).toBe('caught');
  });

  test('aggregateFlags rolls up instances', () => {
    const flags = aggregateFlags(collection.pokemon);
    expect(flags.caught).toBe(true);
    expect(flags.shiny).toBe(true);
    expect(flags.hundo).toBe(true);
  });

  test('completion and filters', () => {
    const rows = buildAggregatedRows(entries, collection, { defaultsOnly: true });
    const stats = completionStats(rows);
    expect(stats.caught).toBe(2);
    expect(stats.total).toBe(3);
    expect(matchesFilter(rows[2], 'missing')).toBe(true);
    expect(searchRows(rows, 'bulba').map((r) => r.entry.speciesId)).toEqual([1]);
    expect(searchRows(rows, '#002').map((r) => r.entry.speciesId)).toEqual([2]);
  });
});

describe('evolutions + goals', () => {
  test('builds incomplete family and ready edge when candy enough', () => {
    const rich: PokemonGoCollection = {
      ...collection,
      pokemon: [
        { speciesId: 1, formId: 163, caught: true, candy: 30 },
        { speciesId: 2, formId: 166, caught: true, candy: 100 },
      ],
    };
    const families = buildEvolutionFamilies(entries, rich);
    expect(getIncompleteFamilies(families)).toHaveLength(1);
    const ready = getReadyEdges(families);
    expect(ready.some((e) => e.toName === 'Venusaur')).toBe(true);
  });

  test('goals summary ranks ready evolve', () => {
    const rich: PokemonGoCollection = {
      ...collection,
      pokemon: [
        { speciesId: 1, formId: 163, caught: true, candy: 30 },
        { speciesId: 2, formId: 166, caught: true, candy: 100 },
      ],
    };
    const summary = buildGoalsSummary(entries, rich);
    expect(summary.readyToEvolve).toBeGreaterThan(0);
    expect(summary.incompleteFamilies).toBe(1);
    expect(summary.nextGoals[0].kind).toBe('ready_evolve');
  });
});

describe('import/export', () => {
  test('json round-trip derives hundo from IV', () => {
    const parsed = parseCollectionJson(
      JSON.stringify({
        importedAt: '2026-01-01T00:00:00.000Z',
        pokemon: [{ speciesId: 25, formId: 0, caught: true, iv: { attack: 15, defense: 15, stamina: 15 } }],
      })
    );
    expect(parsed.pokemon[0].hundo).toBe(true);
  });

  test('csv parse and export', () => {
    const csv = `speciesId,formId,caught,shiny,shadow,lucky,hundo
1,163,true,true,false,false,false
2,166,true,false,false,false,false`;
    const parsed = parseCollectionCsv(csv);
    expect(parsed.pokemon).toHaveLength(2);
    const out = exportCollectionCsv(parsed);
    expect(out.split('\n').length).toBe(3);
  });
});
