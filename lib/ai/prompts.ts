// ============================================================
// AI Provider Abstraction Layer
// ============================================================

import { z } from 'zod';
import type { AICardData } from '@/types/card';
import type { QuizAnswers } from '@/types/quiz';
import type { Pokemon } from '@/types/pokemon';
import type { PersonalityProfile } from '@/types/quiz';

// ── Zod schema for AI response validation ────────────────────────────────────
export const AICardDataSchema = z.object({
  trainerTitle: z.string().min(1),
  trainerDescription: z.string().min(1),
  personalitySummary: z.string().min(1),
  pokemonReasoning: z.string().min(1),
  battleStyle: z.string().min(1),
  signatureMove: z.string().min(1),
  signatureMoveReasoning: z.string().min(1),
  motivationalQuote: z.string().min(1),
  cardFlavorText: z.string().min(1),
  career: z.string().min(1),
  region: z.string().min(1),
  rarity: z.string().min(1),
  rarityReasoning: z.string().optional().default(''),
  story: z.string().min(1),
  backgroundPrompt: z.string().min(1),
  strengths: z.array(z.string()).min(1),
  growthAreas: z.array(z.string()).min(1),
  recommendedTeam: z.array(z.object({ name: z.string(), reason: z.string() })).length(3),
  achievements: z.array(z.string()).min(1),
});

// ── Prompt builder ───────────────────────────────────────────────────────────
export function buildCardPrompt(params: {
  trainerName: string;
  answers: QuizAnswers;
  profile: PersonalityProfile;
  matchedPokemon: Pokemon;
  buddy: Pokemon | null;
  favoriteWon: boolean;
}): string {
  const { trainerName, answers, profile, matchedPokemon, buddy, favoriteWon } = params;
  const topTraits = profile.dominantTraits.join(', ');

  return `You are generating a personalized Pokémon Trainer Card analysis. Return ONLY valid JSON matching the exact schema below.

## Trainer Info
- Name: ${trainerName}
- Buddy (Favorite) Pokémon: ${buddy?.displayName ?? 'None'}
- Matched Pokémon: ${matchedPokemon.displayName} (#${matchedPokemon.id})
- Pokémon Type(s): ${matchedPokemon.types.join(', ')}
- Favorite Won Matchmaking: ${favoriteWon}

## Quiz Answers
1. Problem-solving style: ${answers.q1 ?? 'Not answered'}
2. Preferred environment: ${answers.q2 ?? 'Not answered'}
3. Primary motivation: ${answers.q3 ?? 'Not answered'}
4. Personality type: ${answers.q4 ?? 'Not answered'}
5. Friends describe them as: ${answers.q5 ?? 'Not answered'}

## Personality Profile
Dominant traits: ${topTraits}
Battle style: ${profile.battleStyle}
Archetype: ${profile.trainerArchetype}

## JSON Schema to return:
{
  "trainerTitle": "A unique 2-4 word title (e.g. 'Guardian of the Forest', 'Electric Explorer', 'Shadow Tactician')",
  "trainerDescription": "2-3 sentence vivid description of this trainer's aura and presence",
  "personalitySummary": "4-5 sentence personality report covering core traits, leadership style, and communication style",
  "pokemonReasoning": "3-4 sentences explaining why ${matchedPokemon.displayName} was chosen, referencing specific quiz answers and shared traits",
  "battleStyle": "One of: Aggressive, Defensive, Tactical, Balanced, Support, Speed-focused, Trickster, Adaptive, Strategic",
  "signatureMove": "The name of one Pokémon move that best represents this trainer's personality",
  "signatureMoveReasoning": "2-3 sentences explaining why that move fits",
  "motivationalQuote": "One memorable, original quote (max 15 words) unique to this trainer",
  "cardFlavorText": "40-80 word Pokémon TCG-style flavor text about this trainer and their bond with ${matchedPokemon.displayName}",
  "career": "One Pokémon world career (Gym Leader, Professor, Ranger, Breeder, Elite Four, Champion, Researcher, Explorer, Contest Coordinator, Detective)",
  "region": "One region (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea) where this trainer would thrive",
  "rarity": "One of: Common, Uncommon, Rare, Epic, Legendary, Mythic, Shiny, Secret Rare",
  "rarityReasoning": "One sentence explaining the rarity assignment",
  "story": "150-200 word story about this trainer's first meeting with ${matchedPokemon.displayName}",
  "backgroundPrompt": "Vivid image generation prompt for a card background based on the trainer's personality and Pokémon type",
  "strengths": ["3-5 specific personality strengths"],
  "growthAreas": ["2-3 growth areas"],
  "recommendedTeam": [
    {"name": "Pokémon name", "reason": "1 sentence why it complements this trainer"},
    {"name": "Pokémon name", "reason": "1 sentence why it complements this trainer"},
    {"name": "Pokémon name", "reason": "1 sentence why it complements this trainer"}
  ],
  "achievements": ["3-5 unique achievement badge names that fit this trainer's personality"]
}

Return ONLY the JSON object. No markdown, no explanation, no code fences.`;
}

// ── Fallback deterministic text ──────────────────────────────────────────────
export function generateFallbackAIData(params: {
  trainerName: string;
  matchedPokemon: Pokemon;
  buddy: Pokemon | null;
  profile: PersonalityProfile;
  favoriteWon: boolean;
}): AICardData {
  const { trainerName, matchedPokemon, profile, buddy, favoriteWon } = params;
  const topTrait = profile.dominantTraits[0];
  const archetype = profile.trainerArchetype;

  return {
    trainerTitle: archetype,
    trainerDescription: `${trainerName} radiates the energy of a true ${archetype.toLowerCase()}. Their ${topTrait} nature is immediately apparent to all who cross their path.`,
    personalitySummary: `${trainerName} is a ${profile.dominantTraits.join(', ')} individual whose ${profile.battleStyle.toLowerCase()} approach to challenges sets them apart. They lead with ${profile.dominantTraits[0]} conviction and inspire those around them through their ${profile.dominantTraits[1]} spirit.`,
    pokemonReasoning: favoriteWon
      ? `${matchedPokemon.displayName} won not just because it was your favorite — your personality profile aligned perfectly with its ${matchedPokemon.types.join('/')} spirit. Your ${topTrait} nature mirrors ${matchedPokemon.displayName}'s core essence.`
      : `While ${buddy?.displayName ?? 'your buddy'} holds a special place in your heart, ${matchedPokemon.displayName} emerged as your true personality match. Your ${topTrait} nature and ${matchedPokemon.displayName}'s ${matchedPokemon.types[0]} energy create a powerful resonance.`,
    battleStyle: profile.battleStyle,
    signatureMove: 'Hyper Beam',
    signatureMoveReasoning: `Your ${topTrait} nature calls for a move that demands total commitment — just like you approach every challenge in life.`,
    motivationalQuote: `"Every challenge is another chance to evolve."`,
    cardFlavorText: `${trainerName}, the ${archetype}, forged an unbreakable bond with ${matchedPokemon.displayName} through shared ${topTrait} resolve. Together, they face every challenge as one, their strengths complementing each other perfectly.`,
    career: profile.traits.knowledgeable > 4 ? 'Pokémon Professor' : profile.traits.competitive > 4 ? 'Gym Leader' : profile.traits.protective > 4 ? 'Ranger' : 'Champion',
    region: matchedPokemon.id <= 151 ? 'Kanto' : matchedPokemon.id <= 251 ? 'Johto' : matchedPokemon.id <= 386 ? 'Hoenn' : matchedPokemon.id <= 493 ? 'Sinnoh' : 'Galar',
    rarity: 'Rare',
    rarityReasoning: 'A strong personality match with a uniquely resonant Pokémon.',
    story: `The day ${trainerName} first encountered ${matchedPokemon.displayName} was unlike any other. The wild ${matchedPokemon.displayName} sensed the ${topTrait} energy radiating from the young trainer and approached without hesitation. There was no battle needed — just two kindred spirits recognizing each other. From that moment, they were inseparable, their bond growing stronger with every challenge they faced together. ${trainerName}'s ${profile.dominantTraits[1]} spirit and ${matchedPokemon.displayName}'s natural strengths made them the perfect pair.`,
    backgroundPrompt: `${matchedPokemon.types[0]} type themed landscape, mystical atmosphere, soft glowing particles, cinematic lighting, fantasy art style`,
    strengths: profile.dominantTraits.slice(0, 3).map((t) => `${t.charAt(0).toUpperCase() + t.slice(1)} spirit`),
    growthAreas: ['Patience in difficult moments', 'Trusting others more fully'],
    recommendedTeam: [
      { name: 'Lucario', reason: 'Resonates with your aura and inner strength.' },
      { name: 'Gardevoir', reason: 'Balances your energy with empathy and foresight.' },
      { name: 'Arcanine', reason: 'Matches your loyalty and adventurous spirit.' },
    ],
    achievements: ['Steadfast Soul', 'Kindred Spirit', 'Rising Champion'],
  };
}
