// ============================================================
// Pokémon GO Collector & Goals — Type Definitions
// ============================================================

export type PokedexStatus = 'not_seen' | 'seen' | 'caught';

export type EvolutionEdgeStatus =
  | 'complete'
  | 'missing'
  | 'ready'
  | 'insufficient_candy'
  | 'special_requirement';

export type GoalKind =
  | 'ready_evolve'
  | 'one_requirement_away'
  | 'incomplete_family'
  | 'missing_pokedex'
  | 'missing_forms'
  | 'missing_shiny'
  | 'missing_shadow'
  | 'missing_purified'
  | 'missing_lucky'
  | 'missing_hundo'
  | 'missing_mega'
  | 'missing_primal'
  | 'missing_dynamax'
  | 'missing_gigantamax'
  | 'missing_costume';

export type DexFilter =
  | 'all'
  | 'missing'
  | 'seen'
  | 'caught'
  | 'unevolved'
  | 'shiny'
  | 'shadow'
  | 'purified'
  | 'lucky'
  | 'hundo'
  | 'mega'
  | 'primal'
  | 'dynamax'
  | 'gigantamax'
  | 'costumes'
  | 'forms'
  | 'regional';

export interface CollectionStatus {
  caught: boolean;
  shiny: boolean;
  shadow: boolean;
  purified: boolean;
  lucky: boolean;
  hundo: boolean;
  male: boolean;
  female: boolean;
  mega: boolean;
  primal: boolean;
  dynamax: boolean;
  gigantamax: boolean;
  costume: boolean;
}

export const EMPTY_COLLECTION_STATUS: CollectionStatus = {
  caught: false,
  shiny: false,
  shadow: false,
  purified: false,
  lucky: false,
  hundo: false,
  male: false,
  female: false,
  mega: false,
  primal: false,
  dynamax: false,
  gigantamax: false,
  costume: false,
};

export interface PokemonGoIv {
  attack: number;
  defense: number;
  stamina: number;
}

export interface PokemonGoInstance {
  speciesId: number;
  formId?: number;
  seen?: boolean;
  caught?: boolean;
  shiny?: boolean;
  shadow?: boolean;
  purified?: boolean;
  lucky?: boolean;
  hundo?: boolean;
  cp?: number;
  candy?: number;
  iv?: PokemonGoIv;
  gender?: 'male' | 'female' | 'unknown';
  costumeId?: number;
  mega?: boolean;
  primal?: boolean;
  dynamax?: boolean;
  gigantamax?: boolean;
}

export interface PokemonGoTrainer {
  trainerId?: string;
  nickname?: string;
}

export interface PokemonGoCollection {
  trainer?: PokemonGoTrainer;
  importedAt: string;
  updatedAt?: string;
  pokemon: PokemonGoInstance[];
}

export interface CollectionProvider {
  connect(): Promise<void>;
  getTrainer(): Promise<PokemonGoTrainer | null>;
  getCollection(): Promise<PokemonGoCollection>;
}

/** Raw evolution edge from WatWowMap master data */
export interface PogoEvolution {
  evoId: number;
  formId?: number;
  candyCost?: number;
  itemRequirement?: number;
  mustBeBuddy?: boolean;
  onlyDaytime?: boolean;
  onlyNighttime?: boolean;
  questRequirement?: string;
  genderRequirement?: number | string;
  tradeBonus?: boolean;
}

/** Denormalized dex entry used by the collector UI/engine */
export interface PogoDexEntry {
  key: string; // `${speciesId}:${formId}`
  speciesId: number;
  formId: number;
  name: string;
  formName: string;
  displayName: string;
  isDefault: boolean;
  isCostume: boolean;
  isRegional: boolean;
  types: string[];
  typeIds: number[];
  generation: string;
  genId: number;
  family: number;
  legendary: boolean;
  mythic: boolean;
  evolutions: PogoEvolution[];
  hasTempEvolutions: boolean;
  hasGmax: boolean;
  attack: number;
  defense: number;
  stamina: number;
}

export interface PogoCostume {
  id: number;
  name: string;
  proto: string;
  noEvolve: boolean;
}

export interface PogoTypeInfo {
  typeId: number;
  typeName: string;
}

export interface PogoManifest {
  source: string;
  commit?: string;
  syncedAt: string;
  pokemonCount: number;
  formCount: number;
  costumeCount: number;
  entryCount: number;
}

export interface AggregatedDexRow {
  entry: PogoDexEntry;
  status: PokedexStatus;
  flags: CollectionStatus;
  candy?: number;
  evolutionProgress: { owned: number; total: number };
}

export interface EvolutionFamilyMember {
  entry: PogoDexEntry;
  owned: boolean;
  status: PokedexStatus;
}

export interface EvolutionFamily {
  familyId: number;
  rootSpeciesId: number;
  name: string;
  members: EvolutionFamilyMember[];
  ownedCount: number;
  totalCount: number;
  complete: boolean;
  edges: EvolutionEdge[];
}

export interface EvolutionEdge {
  fromKey: string;
  toKey: string;
  fromName: string;
  toName: string;
  status: EvolutionEdgeStatus;
  candyCost?: number;
  requirementLabel: string;
}

export interface NextGoal {
  id: string;
  kind: GoalKind;
  priority: number;
  title: string;
  subtitle: string;
  href: string;
  count?: number;
}

export interface GoalsSummary {
  readyToEvolve: number;
  incompleteFamilies: number;
  missingPokedex: number;
  missingShiny: number;
  missingShadow: number;
  missingPurified: number;
  missingLucky: number;
  missingHundo: number;
  missingForms: number;
  missingMega: number;
  missingPrimal: number;
  missingDynamax: number;
  missingGigantamax: number;
  missingCostumes: number;
  nextGoals: NextGoal[];
}

export interface GenerationProgress {
  genId: number;
  name: string;
  caught: number;
  total: number;
  percent: number;
}

export function makeDexKey(speciesId: number, formId: number): string {
  return `${speciesId}:${formId}`;
}

export function parseDexKey(key: string): { speciesId: number; formId: number } | null {
  const [a, b] = key.split(':');
  const speciesId = Number(a);
  const formId = Number(b);
  if (!Number.isFinite(speciesId) || !Number.isFinite(formId)) return null;
  return { speciesId, formId };
}
