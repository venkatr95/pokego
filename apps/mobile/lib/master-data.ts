import type { PogoDexEntry } from '@pokeyou/pokemon-go-core';

// Relative path keeps Metro happy in the monorepo
// eslint-disable-next-line @typescript-eslint/no-require-imports
const indexJson = require('../../../packages/pokemon-go-core/data/collector-index.json') as PogoDexEntry[];

let cache: PogoDexEntry[] | null = null;

export function getCollectorIndex(): PogoDexEntry[] {
  if (!cache) cache = indexJson;
  return cache;
}

export function getDefaultEntries(): PogoDexEntry[] {
  return getCollectorIndex().filter((e) => e.isDefault && !e.isCostume);
}
