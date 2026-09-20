import {
  aggregateInstances,
  collectionToEntryRows,
  mergeCollections,
  mergeInstances,
  rowsToCollection,
  type GoCollectionEntryRow,
  type GoCollectionMetaRow,
} from '../lib/pokemon-go/cloud-sync';
import type { PokemonGoCollection } from '../types/pokemon-go';

describe('cloud-sync merge', () => {
  test('OR-merges flags and takes max candy', () => {
    const merged = mergeInstances(
      { speciesId: 1, formId: 0, caught: true, shiny: false, candy: 10 },
      { speciesId: 1, formId: 0, caught: false, shiny: true, candy: 40 }
    );
    expect(merged.caught).toBe(true);
    expect(merged.shiny).toBe(true);
    expect(merged.candy).toBe(40);
  });

  test('aggregateInstances collapses duplicates', () => {
    const list = aggregateInstances([
      { speciesId: 25, formId: 0, caught: true },
      { speciesId: 25, formId: 0, shiny: true },
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].caught).toBe(true);
    expect(list[0].shiny).toBe(true);
  });

  test('mergeCollections unions both sides', () => {
    const local: PokemonGoCollection = {
      importedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      trainer: { nickname: 'Local' },
      pokemon: [{ speciesId: 1, formId: 0, caught: true }],
    };
    const remote: PokemonGoCollection = {
      importedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      trainer: { nickname: 'Remote' },
      pokemon: [{ speciesId: 1, formId: 0, shiny: true }, { speciesId: 4, formId: 0, caught: true }],
    };
    const merged = mergeCollections(local, remote);
    expect(merged.trainer?.nickname).toBe('Local');
    expect(merged.pokemon).toHaveLength(2);
    const bulba = merged.pokemon.find((p) => p.speciesId === 1)!;
    expect(bulba.caught).toBe(true);
    expect(bulba.shiny).toBe(true);
  });

  test('row round-trip preserves flags', () => {
    const collection: PokemonGoCollection = {
      importedAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      trainer: { trainerId: 't1', nickname: 'Ash' },
      pokemon: [
        {
          speciesId: 25,
          formId: 1,
          caught: true,
          shiny: true,
          iv: { attack: 15, defense: 15, stamina: 15 },
        },
      ],
    };
    const rows = collectionToEntryRows('user-1', collection);
    expect(rows[0].hundo).toBe(true);
    expect(rows[0].shiny).toBe(true);

    const meta: GoCollectionMetaRow = {
      user_id: 'user-1',
      trainer_id: 't1',
      trainer_nickname: 'Ash',
      source: 'companion',
      imported_at: collection.importedAt,
      updated_at: collection.updatedAt!,
      sync_enabled: true,
    };
    const back = rowsToCollection(meta, rows as GoCollectionEntryRow[]);
    expect(back?.trainer?.nickname).toBe('Ash');
    expect(back?.pokemon[0].shiny).toBe(true);
    expect(back?.pokemon[0].hundo).toBe(true);
    expect(back?.pokemon[0].iv).toEqual({ attack: 15, defense: 15, stamina: 15 });
  });
});
