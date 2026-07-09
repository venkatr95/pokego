// ============================================================
// Personality Matching Engine
// ============================================================
// Weighted scoring system that maps quiz answers → Pokémon affinity
// Every Pokémon gets a composite score based on trait resonance.
// ============================================================

import type { QuizAnswers, PersonalityTrait, PersonalityProfile } from '@/types/quiz';
import type { Pokemon } from '@/types/pokemon';
import type { RarityTier } from '@/types/quiz';

// ── Trait weights per answer option ─────────────────────────────────────────
// Each answer ID maps to a weighted trait boost
const ANSWER_TRAITS: Record<string, Array<{ trait: PersonalityTrait; weight: number }>> = {
  // Q1: Problem solving
  carefully:       [{ trait: 'strategic', weight: 3 }, { trait: 'calm', weight: 2 }, { trait: 'knowledgeable', weight: 2 }],
  instinctively:   [{ trait: 'brave', weight: 3 }, { trait: 'energetic', weight: 2 }, { trait: 'adventurous', weight: 2 }],
  collaboratively: [{ trait: 'social', weight: 3 }, { trait: 'loyal', weight: 2 }, { trait: 'kind', weight: 2 }],
  experimentally:  [{ trait: 'curious', weight: 3 }, { trait: 'creative', weight: 3 }, { trait: 'playful', weight: 1 }],

  // Q2: Preferred environment
  ocean:           [{ trait: 'calm', weight: 3 }, { trait: 'mysterious', weight: 2 }, { trait: 'adventurous', weight: 2 }],
  mountains:       [{ trait: 'stoic', weight: 3 }, { trait: 'determined', weight: 2 }, { trait: 'powerful', weight: 2 }],
  forest:          [{ trait: 'protective', weight: 3 }, { trait: 'loyal', weight: 2 }, { trait: 'kind', weight: 2 }],
  city:            [{ trait: 'competitive', weight: 3 }, { trait: 'energetic', weight: 2 }, { trait: 'social', weight: 2 }],
  sky:             [{ trait: 'adventurous', weight: 3 }, { trait: 'brave', weight: 2 }, { trait: 'curious', weight: 2 }],

  // Q3: Motivation
  adventure:       [{ trait: 'adventurous', weight: 3 }, { trait: 'brave', weight: 2 }, { trait: 'curious', weight: 2 }],
  knowledge:       [{ trait: 'knowledgeable', weight: 3 }, { trait: 'curious', weight: 2 }, { trait: 'strategic', weight: 2 }],
  friendship:      [{ trait: 'loyal', weight: 3 }, { trait: 'kind', weight: 3 }, { trait: 'social', weight: 2 }],
  power:           [{ trait: 'powerful', weight: 3 }, { trait: 'competitive', weight: 2 }, { trait: 'determined', weight: 2 }],
  protecting:      [{ trait: 'protective', weight: 3 }, { trait: 'loyal', weight: 2 }, { trait: 'brave', weight: 2 }],

  // Q4: Personality
  calm:            [{ trait: 'calm', weight: 3 }, { trait: 'stoic', weight: 2 }, { trait: 'strategic', weight: 2 }],
  energetic:       [{ trait: 'energetic', weight: 3 }, { trait: 'playful', weight: 2 }, { trait: 'adventurous', weight: 2 }],
  curious:         [{ trait: 'curious', weight: 3 }, { trait: 'knowledgeable', weight: 2 }, { trait: 'creative', weight: 2 }],
  loyal:           [{ trait: 'loyal', weight: 3 }, { trait: 'protective', weight: 2 }, { trait: 'reliable', weight: 2 }],
  competitive:     [{ trait: 'competitive', weight: 3 }, { trait: 'determined', weight: 2 }, { trait: 'powerful', weight: 2 }],

  // Q5: How friends describe you
  funny:           [{ trait: 'playful', weight: 3 }, { trait: 'social', weight: 2 }, { trait: 'energetic', weight: 2 }],
  brave:           [{ trait: 'brave', weight: 3 }, { trait: 'determined', weight: 2 }, { trait: 'powerful', weight: 2 }],
  reliable:        [{ trait: 'reliable', weight: 3 }, { trait: 'loyal', weight: 2 }, { trait: 'protective', weight: 2 }],
  creative:        [{ trait: 'creative', weight: 3 }, { trait: 'curious', weight: 2 }, { trait: 'playful', weight: 2 }],
  kind:            [{ trait: 'kind', weight: 3 }, { trait: 'social', weight: 2 }, { trait: 'loyal', weight: 2 }],
};

// ── Pokémon trait affinity map ──────────────────────────────────────────────
// Each Pokémon gets affinity scores for traits
// Extended to cover all 1025 Pokémon via type-based defaults + overrides
const POKEMON_TRAIT_OVERRIDES: Record<number, Partial<Record<PersonalityTrait, number>>> = {
  // Gen 1 starters
  1:   { loyal: 5, protective: 4, kind: 3 },            // Bulbasaur
  4:   { brave: 5, energetic: 4, determined: 3 },        // Charmander
  7:   { calm: 4, strategic: 4, protective: 3 },         // Squirtle
  25:  { energetic: 5, playful: 4, curious: 3 },         // Pikachu
  39:  { kind: 5, playful: 4, social: 3 },               // Jigglypuff
  52:  { playful: 5, curious: 4, energetic: 3 },         // Meowth
  54:  { curious: 4, calm: 3, adventurous: 3 },          // Psyduck
  63:  { knowledgeable: 5, curious: 4, strategic: 3 },   // Abra
  94:  { playful: 4, mysterious: 5, creative: 3 },       // Gengar
  131: { calm: 5, mysterious: 4, powerful: 3 },          // Lapras
  133: { curious: 5, adventurous: 4, social: 3 },        // Eevee
  143: { calm: 5, loyal: 4, stoic: 3 },                  // Snorlax
  147: { determined: 5, brave: 4, adventurous: 3 },      // Dratini
  150: { powerful: 5, stoic: 4, mysterious: 3 },         // Mewtwo
  151: { curious: 5, adventurous: 5, playful: 3 },       // Mew

  // Gen 2
  157: { brave: 5, determined: 5, energetic: 4 },        // Typhlosion
  196: { curious: 4, knowledgeable: 4, calm: 3 },        // Espeon
  197: { mysterious: 5, loyal: 4, protective: 3 },       // Umbreon
  249: { calm: 5, powerful: 5, stoic: 4 },               // Lugia
  250: { brave: 5, powerful: 5, protective: 4 },         // Ho-Oh

  // Gen 3
  257: { brave: 5, energetic: 5, competitive: 4 },       // Blaziken
  282: { kind: 5, protective: 5, loyal: 4 },             // Gardevoir
  330: { competitive: 4, determined: 4, adventurous: 3 }, // Flygon
  359: { mysterious: 5, brave: 4, determined: 4 },       // Absol

  // Gen 4
  448: { loyal: 5, brave: 5, protective: 5 },            // Lucario
  445: { powerful: 5, competitive: 5, determined: 4 },   // Garchomp
  471: { calm: 5, loyal: 4, stoic: 4 },                  // Glaceon

  // Gen 5
  494: { adventurous: 5, brave: 5, curious: 4 },         // Victini
  503: { calm: 5, strategic: 5, loyal: 4 },              // Samurott
  571: { curious: 5, playful: 5, creative: 4 },          // Zoroark

  // Gen 6
  658: { strategic: 5, calm: 4, competitive: 4 },        // Greninja
  700: { kind: 5, social: 4, creative: 4 },              // Sylveon

  // Gen 7
  791: { calm: 5, mysterious: 5, powerful: 4 },          // Solgaleo
  792: { mysterious: 5, powerful: 5, stoic: 4 },         // Lunala

  // Charizard, Dragonite, etc.
  6:   { brave: 5, powerful: 5, adventurous: 4 },        // Charizard
  149: { loyal: 5, brave: 4, protective: 4 },            // Dragonite
  59:  { loyal: 5, brave: 5, protective: 4 },            // Arcanine
  9:   { protective: 5, calm: 4, strategic: 4 },         // Blastoise
  154: { protective: 5, kind: 4, loyal: 4 },             // Meganium
  233: { creative: 5, curious: 5, knowledgeable: 4 },    // Porygon2 (Smeargle proxy)
  235: { creative: 5, curious: 4, playful: 4 },          // Smeargle
};

// Type-based default trait affinities (fallback for all Pokémon)
const TYPE_TRAIT_DEFAULTS: Record<string, Partial<Record<PersonalityTrait, number>>> = {
  fire:     { brave: 3, energetic: 3, determined: 2 },
  water:    { calm: 3, strategic: 2, adventurous: 2 },
  grass:    { protective: 3, kind: 3, loyal: 2 },
  electric: { energetic: 3, playful: 2, curious: 2 },
  psychic:  { knowledgeable: 3, curious: 3, strategic: 2 },
  ice:      { calm: 3, stoic: 3, mysterious: 2 },
  fighting: { brave: 3, determined: 3, competitive: 2 },
  poison:   { mysterious: 3, creative: 2, competitive: 2 },
  ground:   { stoic: 3, determined: 2, powerful: 2 },
  flying:   { adventurous: 3, brave: 2, curious: 2 },
  bug:      { curious: 3, reliable: 2, social: 2 },
  rock:     { stoic: 3, determined: 3, powerful: 2 },
  ghost:    { mysterious: 3, creative: 3, playful: 2 },
  dragon:   { powerful: 3, brave: 3, adventurous: 2 },
  dark:     { strategic: 3, mysterious: 3, competitive: 2 },
  steel:    { reliable: 3, protective: 3, stoic: 2 },
  fairy:    { kind: 3, social: 3, creative: 2 },
  normal:   { reliable: 2, loyal: 2, social: 2 },
};

// ── Core functions ───────────────────────────────────────────────────────────

/** Build a trait score profile from quiz answers */
export function buildPersonalityProfile(answers: QuizAnswers): PersonalityProfile {
  const traits: Record<PersonalityTrait, number> = {
    brave: 0, curious: 0, calm: 0, loyal: 0, energetic: 0,
    creative: 0, strategic: 0, protective: 0, funny: 0, determined: 0,
    adventurous: 0, knowledgeable: 0, social: 0, powerful: 0, competitive: 0,
    reliable: 0, kind: 0, mysterious: 0, playful: 0, stoic: 0,
  };

  const answerValues = [answers.q1, answers.q2, answers.q3, answers.q4, answers.q5];
  for (const answer of answerValues) {
    if (!answer) continue;
    const traitWeights = ANSWER_TRAITS[answer] ?? [];
    for (const { trait, weight } of traitWeights) {
      traits[trait] = (traits[trait] ?? 0) + weight;
    }
  }

  // Sort dominant traits
  const sorted = (Object.entries(traits) as [PersonalityTrait, number][])
    .sort((a, b) => b[1] - a[1]);
  const dominantTraits = sorted.slice(0, 3).map(([t]) => t);

  // Determine battle style from top traits
  const topTrait = dominantTraits[0];
  const battleStyleMap: Record<PersonalityTrait, string> = {
    brave: 'Aggressive', strategic: 'Tactical', calm: 'Defensive',
    energetic: 'Speed-focused', loyal: 'Support', curious: 'Adaptive',
    creative: 'Trickster', protective: 'Support', powerful: 'Aggressive',
    competitive: 'Aggressive', determined: 'Balanced', knowledgeable: 'Tactical',
    social: 'Support', mysterious: 'Trickster', stoic: 'Defensive',
    adventurous: 'Balanced', kind: 'Support', playful: 'Trickster',
    reliable: 'Defensive', funny: 'Trickster',
  };
  const battleStyle = battleStyleMap[topTrait] ?? 'Balanced';

  const archetypeMap: Record<PersonalityTrait, string> = {
    brave: 'The Fearless Warrior', strategic: 'The Master Tactician', calm: 'The Zen Master',
    energetic: 'The Lightning Bolt', loyal: 'The Eternal Guardian', curious: 'The Pokémon Professor',
    creative: 'The Creative Genius', protective: 'The Steadfast Defender', powerful: 'The Champion',
    competitive: 'The Rising Star', determined: 'The Unstoppable Force', knowledgeable: 'The Scholar',
    social: 'The Community Pillar', mysterious: 'The Shadow Walker', stoic: 'The Mountain Sage',
    adventurous: 'The Explorer', kind: 'The Heart of Gold', playful: 'The Joyful Spirit',
    reliable: 'The Rock of Reliability', funny: 'The Life of the Party',
  };
  const trainerArchetype = archetypeMap[topTrait] ?? 'The Rising Trainer';

  return { traits, dominantTraits, battleStyle, trainerArchetype };
}

/** Score all Pokémon based on personality profile */
export function scorePokemon(
  pokemon: Pokemon[],
  profile: PersonalityProfile,
): Array<{ pokemon: Pokemon; score: number }> {
  return pokemon.map((p) => {
    let score = 0;

    // Type-based defaults
    for (const typeName of p.types) {
      const typeDefaults = TYPE_TRAIT_DEFAULTS[typeName] ?? {};
      for (const [trait, typeWeight] of Object.entries(typeDefaults) as [PersonalityTrait, number][]) {
        score += (profile.traits[trait] ?? 0) * typeWeight;
      }
    }

    // Specific Pokémon overrides
    const overrides = POKEMON_TRAIT_OVERRIDES[p.id] ?? {};
    for (const [trait, overrideWeight] of Object.entries(overrides) as [PersonalityTrait, number][]) {
      score += (profile.traits[trait] ?? 0) * overrideWeight;
    }

    // Legendary/Mythical bonus for "powerful" trait
    if ((p.isLegendary || p.isMythical) && profile.traits.powerful > 3) {
      score += 10;
    }

    return { pokemon: p, score };
  });
}

/** Apply favorite Pokémon bonus and return final ranked list */
export function rankWithFavorite(
  scores: Array<{ pokemon: Pokemon; score: number }>,
  favoritePokemonId: number | null,
  bonus = 5,
): Array<{ pokemon: Pokemon; score: number; isFavorite: boolean }> {
  const ranked = scores.map((s) => ({
    ...s,
    isFavorite: s.pokemon.id === favoritePokemonId,
    score: s.pokemon.id === favoritePokemonId ? s.score + bonus : s.score,
  }));
  return ranked.sort((a, b) => b.score - a.score);
}

/** Full pipeline: answers → top matched Pokémon */
export function matchPokemon(
  answers: QuizAnswers,
  allPokemon: Pokemon[],
  favoriteBonus = 5,
): {
  profile: PersonalityProfile;
  ranked: Array<{ pokemon: Pokemon; score: number; isFavorite: boolean }>;
  winner: Pokemon;
  favoriteWon: boolean;
} {
  const profile = buildPersonalityProfile(answers);
  const scores = scorePokemon(allPokemon, profile);
  const ranked = rankWithFavorite(scores, answers.favoritePokemonId, favoriteBonus);
  const winner = ranked[0].pokemon;
  const favoriteWon = winner.id === answers.favoritePokemonId;
  return { profile, ranked, winner, favoriteWon };
}

/** Calculate rarity from score and profile strength */
export function calculateRarity(
  score: number,
  profile: PersonalityProfile,
  isLegendary: boolean,
  isMythical: boolean,
): RarityTier {
  const traitMax = Math.max(...Object.values(profile.traits));
  const uniqueness = traitMax; // How focused the personality is

  if (isMythical && score > 200)                  return 'Secret Rare';
  if (isLegendary && score > 180)                 return 'Mythic';
  if (isLegendary || (isMythical && score > 150)) return 'Legendary';
  if (score > 160 && uniqueness >= 8)             return 'Shiny';
  if (score > 130 || uniqueness >= 7)             return 'Epic';
  if (score > 100 || uniqueness >= 5)             return 'Rare';
  if (score > 70  || uniqueness >= 3)             return 'Uncommon';
  return 'Common';
}

/** Calculate XP level (1-100) from profile */
export function calculateXP(profile: PersonalityProfile): number {
  const traitSum = Object.values(profile.traits).reduce((a, b) => a + b, 0);
  return Math.min(100, Math.max(1, Math.round((traitSum / 50) * 100)));
}

/** Calculate friendship level (0-255) */
export function calculateFriendship(answers: QuizAnswers, profile: PersonalityProfile): number {
  const social = profile.traits.social ?? 0;
  const loyal  = profile.traits.loyal  ?? 0;
  const kind   = profile.traits.kind   ?? 0;
  const raw = (social + loyal + kind) * 15;
  return Math.min(255, Math.max(0, raw));
}

/** Calculate derived stat scores (0-100) */
export function calculateDerivedStats(profile: PersonalityProfile): {
  adventureScore: number;
  courageScore: number;
  intelligenceScore: number;
  teamworkScore: number;
  creativityScore: number;
  determinationScore: number;
} {
  const t = profile.traits;
  const cap = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
  return {
    adventureScore:   cap((t.adventurous + t.brave + t.curious)       * 8),
    courageScore:     cap((t.brave + t.determined + t.competitive)     * 8),
    intelligenceScore:cap((t.knowledgeable + t.strategic + t.curious)  * 8),
    teamworkScore:    cap((t.social + t.loyal + t.kind + t.protective) * 6),
    creativityScore:  cap((t.creative + t.playful + t.curious)         * 9),
    determinationScore:cap((t.determined + t.stoic + t.competitive)    * 8),
  };
}
