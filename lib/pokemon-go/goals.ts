// ============================================================
// Goals dashboard + deterministic Next Goals ranking
// ============================================================

import type {
  AggregatedDexRow,
  EvolutionFamily,
  GoalsSummary,
  NextGoal,
  PokemonGoCollection,
  PogoDexEntry,
} from '@/types/pokemon-go';
import { buildAggregatedRows } from './engine';
import {
  buildEvolutionFamilies,
  getIncompleteFamilies,
  getMissingEdges,
  getReadyEdges,
} from './evolutions';

const PRIORITY: Record<NextGoal['kind'], number> = {
  ready_evolve: 1,
  one_requirement_away: 2,
  incomplete_family: 3,
  missing_pokedex: 4,
  missing_forms: 5,
  missing_shiny: 6,
  missing_shadow: 7,
  missing_purified: 8,
  missing_lucky: 9,
  missing_hundo: 10,
  missing_mega: 11,
  missing_primal: 12,
  missing_dynamax: 13,
  missing_gigantamax: 14,
  missing_costume: 15,
};

export function buildGoalsSummary(
  entries: PogoDexEntry[],
  collection: PokemonGoCollection | null
): GoalsSummary {
  const defaultRows = buildAggregatedRows(entries, collection, { defaultsOnly: true });
  const allRows = buildAggregatedRows(entries, collection, { defaultsOnly: false });
  const families = buildEvolutionFamilies(entries, collection);
  const incomplete = getIncompleteFamilies(families);
  const ready = getReadyEdges(families);
  const missingEdges = getMissingEdges(families);

  const missingPokedex = defaultRows.filter((r) => r.status === 'not_seen').length;
  const formRows = allRows.filter((r) => !r.entry.isDefault && !r.entry.isCostume);
  const costumeRows = allRows.filter((r) => r.entry.isCostume);
  const missingForms = formRows.filter((r) => r.status !== 'caught').length;
  const missingCostumes = costumeRows.filter((r) => r.status !== 'caught').length;

  const missingShiny = defaultRows.filter((r) => r.status === 'caught' && !r.flags.shiny).length
    + defaultRows.filter((r) => r.status !== 'caught').length;
  const missingShadow = defaultRows.filter((r) => !r.flags.shadow).length;
  const missingPurified = defaultRows.filter((r) => !r.flags.purified).length;
  const missingLucky = defaultRows.filter((r) => !r.flags.lucky).length;
  const missingHundo = defaultRows.filter((r) => !r.flags.hundo).length;
  const missingMega = defaultRows.filter((r) => r.entry.hasTempEvolutions && !r.flags.mega).length;
  const missingPrimal = defaultRows.filter((r) => !r.flags.primal).length;
  const missingDynamax = defaultRows.filter((r) => !r.flags.dynamax).length;
  const missingGigantamax = defaultRows.filter(
    (r) => r.entry.hasGmax && !r.flags.gigantamax
  ).length;

  const nextGoals = buildNextGoals({
    ready,
    missingEdges,
    incomplete,
    missingPokedex,
    missingForms,
    missingShiny,
    missingShadow,
    missingLucky,
    missingHundo,
    defaultRows,
  });

  return {
    readyToEvolve: ready.length,
    incompleteFamilies: incomplete.length,
    missingPokedex,
    missingShiny,
    missingShadow,
    missingPurified,
    missingLucky,
    missingHundo,
    missingForms,
    missingMega,
    missingPrimal,
    missingDynamax,
    missingGigantamax,
    missingCostumes,
    nextGoals,
  };
}

function buildNextGoals(input: {
  ready: ReturnType<typeof getReadyEdges>;
  missingEdges: ReturnType<typeof getMissingEdges>;
  incomplete: EvolutionFamily[];
  missingPokedex: number;
  missingForms: number;
  missingShiny: number;
  missingShadow: number;
  missingLucky: number;
  missingHundo: number;
  defaultRows: AggregatedDexRow[];
}): NextGoal[] {
  const goals: NextGoal[] = [];

  for (const edge of input.ready.slice(0, 5)) {
    goals.push({
      id: `ready-${edge.fromKey}-${edge.toKey}`,
      kind: 'ready_evolve',
      priority: PRIORITY.ready_evolve,
      title: `Evolve ${edge.fromName} → ${edge.toName}`,
      subtitle: edge.candyCost != null ? `${edge.candyCost} Candy · Ready` : 'Ready',
      href: '/pokemon-go/evolutions?view=ready',
    });
  }

  const almost = input.missingEdges
    .filter((e) => e.status === 'insufficient_candy' || e.status === 'special_requirement')
    .slice(0, 5);
  for (const edge of almost) {
    goals.push({
      id: `near-${edge.fromKey}-${edge.toKey}`,
      kind: 'one_requirement_away',
      priority: PRIORITY.one_requirement_away,
      title: `Evolve ${edge.fromName} → ${edge.toName}`,
      subtitle: edge.requirementLabel,
      href: '/pokemon-go/evolutions?view=missing',
    });
  }

  for (const fam of input.incomplete.slice(0, 5)) {
    const missing = fam.members.filter((m) => !m.owned).map((m) => m.entry.name);
    goals.push({
      id: `fam-${fam.familyId}`,
      kind: 'incomplete_family',
      priority: PRIORITY.incomplete_family,
      title: `Complete ${fam.name}`,
      subtitle:
        missing.length === 1
          ? `${missing[0]} missing`
          : `${missing.length} evolutions missing`,
      href: '/pokemon-go/evolutions?view=unevolved',
      count: fam.totalCount - fam.ownedCount,
    });
  }

  if (input.missingPokedex > 0) {
    goals.push({
      id: 'missing-dex',
      kind: 'missing_pokedex',
      priority: PRIORITY.missing_pokedex,
      title: 'Fill missing Pokédex entries',
      subtitle: `${input.missingPokedex} missing`,
      href: '/pokemon-go/missing?filter=missing',
      count: input.missingPokedex,
    });
  }

  if (input.missingForms > 0) {
    goals.push({
      id: 'missing-forms',
      kind: 'missing_forms',
      priority: PRIORITY.missing_forms,
      title: 'Collect missing forms',
      subtitle: `${input.missingForms} forms missing`,
      href: '/pokemon-go/forms?missing=1',
      count: input.missingForms,
    });
  }

  const specials: Array<{ kind: NextGoal['kind']; count: number; title: string; filter: string }> = [
    { kind: 'missing_shiny', count: input.missingShiny, title: 'Hunt missing shinies', filter: 'shiny' },
    { kind: 'missing_shadow', count: input.missingShadow, title: 'Hunt missing shadows', filter: 'shadow' },
    { kind: 'missing_lucky', count: input.missingLucky, title: 'Hunt missing luckies', filter: 'lucky' },
    { kind: 'missing_hundo', count: input.missingHundo, title: 'Hunt missing hundos', filter: 'hundo' },
  ];

  for (const s of specials) {
    if (s.count <= 0) continue;
    goals.push({
      id: s.kind,
      kind: s.kind,
      priority: PRIORITY[s.kind],
      title: s.title,
      subtitle: `${s.count} remaining`,
      href: `/pokemon-go/missing?filter=${s.filter}`,
      count: s.count,
    });
  }

  return goals
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))
    .slice(0, 12);
}
