// ============================================================
// Evolution family builder & classification
// ============================================================

import type {
  AggregatedDexRow,
  EvolutionEdge,
  EvolutionEdgeStatus,
  EvolutionFamily,
  PogoDexEntry,
  PogoEvolution,
  PokemonGoCollection,
} from '@/types/pokemon-go';
import { makeDexKey } from '@/types/pokemon-go';
import { buildAggregatedRows, indexCollection } from './engine';

function requirementLabel(evo: PogoEvolution): string {
  const parts: string[] = [];
  if (evo.candyCost != null) parts.push(`${evo.candyCost} Candy`);
  if (evo.tradeBonus) parts.push('Trade');
  if (evo.mustBeBuddy) parts.push('Buddy');
  if (evo.onlyDaytime) parts.push('Daytime');
  if (evo.onlyNighttime) parts.push('Nighttime');
  if (evo.questRequirement) parts.push('Special quest');
  if (evo.itemRequirement) parts.push('Evolution item');
  if (evo.genderRequirement != null) parts.push('Gender requirement');
  if (parts.length === 0) return 'See Pokémon GO';
  return parts.join(' · ');
}

function hasSpecialRequirement(evo: PogoEvolution): boolean {
  return !!(
    evo.tradeBonus ||
    evo.mustBeBuddy ||
    evo.onlyDaytime ||
    evo.onlyNighttime ||
    evo.questRequirement ||
    evo.itemRequirement ||
    evo.genderRequirement != null
  );
}

function classifyEdge(
  fromOwned: boolean,
  toOwned: boolean,
  evo: PogoEvolution,
  candy: number | undefined
): EvolutionEdgeStatus {
  if (toOwned) return 'complete';
  if (!fromOwned) return 'missing';
  if (hasSpecialRequirement(evo) && (candy == null || evo.candyCost == null || candy >= evo.candyCost)) {
    // Owned base, special requirement present — don't invent "ready"
    if (evo.tradeBonus && (candy == null || (evo.candyCost != null && candy >= evo.candyCost))) {
      return 'special_requirement';
    }
    if (hasSpecialRequirement(evo)) return 'special_requirement';
  }
  if (evo.candyCost != null) {
    if (candy == null) {
      // Candy unknown: show requirement but not "ready"
      return hasSpecialRequirement(evo) ? 'special_requirement' : 'insufficient_candy';
    }
    if (candy >= evo.candyCost && !hasSpecialRequirement(evo)) return 'ready';
    if (candy >= evo.candyCost && hasSpecialRequirement(evo)) return 'special_requirement';
    return 'insufficient_candy';
  }
  // No candy cost in data and no special flags
  return hasSpecialRequirement(evo) ? 'special_requirement' : 'missing';
}

function resolveTargetKey(evo: PogoEvolution, entriesBySpecies: Map<number, PogoDexEntry[]>): string {
  const candidates = entriesBySpecies.get(evo.evoId) ?? [];
  if (evo.formId != null) {
    const match = candidates.find((c) => c.formId === evo.formId);
    if (match) return match.key;
    return makeDexKey(evo.evoId, evo.formId);
  }
  const def = candidates.find((c) => c.isDefault) ?? candidates[0];
  return def?.key ?? makeDexKey(evo.evoId, 0);
}

export function buildEvolutionFamilies(
  entries: PogoDexEntry[],
  collection: PokemonGoCollection | null
): EvolutionFamily[] {
  const rows = buildAggregatedRows(entries, collection, { defaultsOnly: false });
  const rowByKey = new Map(rows.map((r) => [r.entry.key, r]));
  const index = indexCollection(collection);

  const defaults = entries.filter((e) => e.isDefault && !e.isCostume);
  const bySpecies = new Map<number, PogoDexEntry[]>();
  for (const e of defaults) {
    const list = bySpecies.get(e.speciesId) ?? [];
    list.push(e);
    bySpecies.set(e.speciesId, list);
  }

  const byFamily = new Map<number, PogoDexEntry[]>();
  for (const e of defaults) {
    const list = byFamily.get(e.family) ?? [];
    list.push(e);
    byFamily.set(e.family, list);
  }

  const families: EvolutionFamily[] = [];

  for (const [familyId, members] of byFamily) {
    members.sort((a, b) => a.speciesId - b.speciesId);
    const root = members.find((m) => m.speciesId === familyId) ?? members[0];
    const familyMembers = members.map((entry) => {
      const row = rowByKey.get(entry.key);
      return {
        entry,
        owned: row?.status === 'caught',
        status: row?.status ?? ('not_seen' as const),
      };
    });

    const ownedCount = familyMembers.filter((m) => m.owned).length;
    const edges: EvolutionEdge[] = [];

    for (const member of members) {
      for (const evo of member.evolutions) {
        const toKey = resolveTargetKey(evo, bySpecies);
        const fromRow = rowByKey.get(member.key);
        const toRow = rowByKey.get(toKey);
        // Candy is family-scoped in GO — take the max across family members.
        let candy = fromRow?.candy ?? index.candyBySpecies.get(member.speciesId);
        for (const m of members) {
          const c = index.candyBySpecies.get(m.speciesId) ?? rowByKey.get(m.key)?.candy;
          if (c != null && (candy == null || c > candy)) candy = c;
        }

        const status = classifyEdge(
          fromRow?.status === 'caught',
          toRow?.status === 'caught',
          evo,
          candy
        );

        edges.push({
          fromKey: member.key,
          toKey,
          fromName: member.displayName,
          toName: toRow?.entry.displayName ?? `Species ${evo.evoId}`,
          status,
          candyCost: evo.candyCost,
          requirementLabel: requirementLabel(evo),
        });
      }
    }

    families.push({
      familyId,
      rootSpeciesId: root.speciesId,
      name: `${root.name} Family`,
      members: familyMembers,
      ownedCount,
      totalCount: familyMembers.length,
      complete: ownedCount === familyMembers.length && familyMembers.length > 0,
      edges,
    });
  }

  return families.sort((a, b) => a.rootSpeciesId - b.rootSpeciesId);
}

export function getIncompleteFamilies(families: EvolutionFamily[]): EvolutionFamily[] {
  return families.filter((f) => f.totalCount > 1 && !f.complete && f.ownedCount > 0);
}

export function getReadyEdges(families: EvolutionFamily[]): EvolutionEdge[] {
  return families.flatMap((f) => f.edges.filter((e) => e.status === 'ready'));
}

export function getMissingEdges(families: EvolutionFamily[]): EvolutionEdge[] {
  return families.flatMap((f) =>
    f.edges.filter((e) => e.status === 'missing' || e.status === 'insufficient_candy' || e.status === 'special_requirement')
  );
}

export function familyProgressForRow(row: AggregatedDexRow, families: EvolutionFamily[]): {
  owned: number;
  total: number;
} {
  const fam = families.find((f) => f.familyId === row.entry.family);
  if (!fam) return row.evolutionProgress;
  return { owned: fam.ownedCount, total: fam.totalCount };
}
