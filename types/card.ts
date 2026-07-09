// ============================================================
// Card & AI Type Definitions
// ============================================================

import type { Pokemon } from './pokemon';
import type { PersonalityProfile, RarityTier, QuizAnswers } from './quiz';

export interface SignatureMove {
  name: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  category: 'Physical' | 'Special' | 'Status';
  description: string;
}

export interface RecommendedTeamMember {
  name: string;
  reason: string;
}

export interface AICardData {
  trainerTitle: string;
  trainerDescription: string;
  personalitySummary: string;
  pokemonReasoning: string;
  battleStyle: string;
  signatureMove: string;
  signatureMoveReasoning: string;
  motivationalQuote: string;
  cardFlavorText: string;
  career: string;
  region: string;
  rarity: RarityTier;
  rarityReasoning: string;
  story: string;
  backgroundPrompt: string;
  strengths: string[];
  growthAreas: string[];
  recommendedTeam: RecommendedTeamMember[];
  achievements: string[];
}

export interface GeneratedCard {
  id: string;                  // UUID
  cardNumber: string;          // e.g. "POKE-2024-004721"
  generatedAt: string;         // ISO date string
  trainerName: string;
  buddy: Pokemon | null;       // Favorite Pokémon
  matchedPokemon: Pokemon;     // Algorithm-selected Pokémon
  matchScore: number;          // Raw personality match score
  favoriteWon: boolean;        // Whether favorite beat the algorithm
  personality: PersonalityProfile;
  answers: QuizAnswers;

  // Card stats
  xpLevel: number;             // 1-100, derived from answers
  friendshipLevel: number;     // 0-255, Pokémon friendship scale
  powerScore: number;          // Composite score
  adventureScore: number;
  courageScore: number;
  intelligenceScore: number;
  teamworkScore: number;
  creativityScore: number;
  determinationScore: number;

  rarity: RarityTier;
  signatureMove: SignatureMove | null;
  aiData: AICardData | null;   // null if AI unavailable
}

export type CardDownloadFormat =
  | 'png'
  | 'jpeg'
  | 'pdf'
  | 'pokemon-card'    // 63×88mm
  | 'wallpaper-mobile'
  | 'wallpaper-desktop';

export interface CardDownloadOptions {
  format: CardDownloadFormat;
  quality?: number;     // 0-1 for JPEG
  scale?: number;       // pixel ratio multiplier
}

// Trainer Rank tiers
export type TrainerRank =
  | 'Youngster' | 'Bug Catcher' | 'Camper' | 'Hiker'
  | 'Gym Trainer' | 'Ace Trainer' | 'Elite Four'
  | 'Gym Leader' | 'Champion';

export function getTrainerRank(xpLevel: number): TrainerRank {
  if (xpLevel < 10)  return 'Youngster';
  if (xpLevel < 20)  return 'Bug Catcher';
  if (xpLevel < 35)  return 'Camper';
  if (xpLevel < 50)  return 'Hiker';
  if (xpLevel < 60)  return 'Gym Trainer';
  if (xpLevel < 75)  return 'Ace Trainer';
  if (xpLevel < 85)  return 'Elite Four';
  if (xpLevel < 95)  return 'Gym Leader';
  return 'Champion';
}
