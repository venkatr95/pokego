// ============================================================
// Card Generator
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type { Pokemon } from '@/types/pokemon';
import type { QuizAnswers, RarityTier } from '@/types/quiz';
import type { GeneratedCard, SignatureMove } from '@/types/card';
import type { PersonalityProfile } from '@/types/quiz';
import type { AICardData } from '@/types/card';
import {
  calculateRarity,
  calculateXP,
  calculateFriendship,
  calculateDerivedStats,
} from './personality-engine';

// ── Signature Move Selection ─────────────────────────────────────────────────
// Maps dominant personality trait → a thematic move name
const TRAIT_SIGNATURE_MOVES: Record<string, SignatureMove> = {
  brave: {
    name: 'Sacred Fire',
    type: 'fire',
    power: 100,
    accuracy: 95,
    category: 'Physical',
    description: 'Your fearless heart burns with the intensity of a sacred flame, never backing down from any challenge.',
  },
  strategic: {
    name: 'Future Sight',
    type: 'psychic',
    power: 120,
    accuracy: 100,
    category: 'Special',
    description: 'Your ability to see several steps ahead gives you an edge that opponents never see coming.',
  },
  calm: {
    name: 'Calm Mind',
    type: 'psychic',
    power: null,
    accuracy: null,
    category: 'Status',
    description: 'Your inner tranquility allows you to gather strength while others rush forward recklessly.',
  },
  energetic: {
    name: 'Thunder',
    type: 'electric',
    power: 110,
    accuracy: 70,
    category: 'Special',
    description: 'Your boundless energy crackles like lightning — unpredictable, powerful, and impossible to ignore.',
  },
  loyal: {
    name: 'Aura Sphere',
    type: 'fighting',
    power: 80,
    accuracy: null,
    category: 'Special',
    description: 'Your unwavering loyalty and bond with allies creates an unstoppable force that never misses.',
  },
  curious: {
    name: 'Psystrike',
    type: 'psychic',
    power: 100,
    accuracy: 100,
    category: 'Special',
    description: 'Your endless curiosity and mental agility manifest as a strike that cuts through any defense.',
  },
  creative: {
    name: 'Sketch',
    type: 'normal',
    power: null,
    accuracy: null,
    category: 'Status',
    description: 'Your creative mind allows you to adapt and learn anything, making you endlessly versatile.',
  },
  protective: {
    name: 'Protect',
    type: 'normal',
    power: null,
    accuracy: null,
    category: 'Status',
    description: 'Your instinct to shield those you care about creates an impenetrable barrier around your allies.',
  },
  powerful: {
    name: 'Hyper Beam',
    type: 'normal',
    power: 150,
    accuracy: 90,
    category: 'Special',
    description: 'When you unleash your full power, nothing can stand in your way — pure overwhelming force.',
  },
  competitive: {
    name: 'Close Combat',
    type: 'fighting',
    power: 120,
    accuracy: 100,
    category: 'Physical',
    description: 'Your relentless competitive drive pushes you beyond your limits, achieving what others only dream of.',
  },
  determined: {
    name: 'Giga Impact',
    type: 'normal',
    power: 150,
    accuracy: 90,
    category: 'Physical',
    description: 'Once you set your mind on a goal, nothing — absolutely nothing — will stop you from achieving it.',
  },
  kind: {
    name: 'Moonblast',
    type: 'fairy',
    power: 95,
    accuracy: 100,
    category: 'Special',
    description: 'Your kindness is a powerful force that touches hearts and can overcome even the darkest challenges.',
  },
  mysterious: {
    name: 'Shadow Ball',
    type: 'ghost',
    power: 80,
    accuracy: 100,
    category: 'Special',
    description: 'Your mysterious nature keeps everyone guessing, striking from unexpected angles with perfect timing.',
  },
  adventurous: {
    name: 'Dragon Rush',
    type: 'dragon',
    power: 100,
    accuracy: 75,
    category: 'Physical',
    description: 'Your adventurous spirit drives you to take bold risks, charging headfirst into the unknown.',
  },
  social: {
    name: 'Helping Hand',
    type: 'normal',
    power: null,
    accuracy: null,
    category: 'Status',
    description: 'Your natural ability to uplift and support others multiplies the power of everyone around you.',
  },
  stoic: {
    name: 'Iron Defense',
    type: 'steel',
    power: null,
    accuracy: null,
    category: 'Status',
    description: 'Your stoic resolve and emotional fortitude create defenses that no force can penetrate.',
  },
  knowledgeable: {
    name: 'Thunderbolt',
    type: 'electric',
    power: 90,
    accuracy: 100,
    category: 'Special',
    description: 'Your vast knowledge translates into precision strikes — calculated, reliable, and devastatingly effective.',
  },
  playful: {
    name: 'Play Rough',
    type: 'fairy',
    power: 90,
    accuracy: 90,
    category: 'Physical',
    description: 'Your playful nature hides a surprisingly powerful punch that catches opponents completely off-guard.',
  },
  reliable: {
    name: 'Earthquake',
    type: 'ground',
    power: 100,
    accuracy: 100,
    category: 'Physical',
    description: 'Your absolute reliability creates a solid foundation — when it matters most, you never falter.',
  },
  funny: {
    name: 'Sing',
    type: 'normal',
    power: null,
    accuracy: 55,
    category: 'Status',
    description: 'Your infectious personality and humor disarm opponents before they even realize the battle has begun.',
  },
};

export function selectSignatureMove(profile: PersonalityProfile): SignatureMove {
  const top = profile.dominantTraits[0];
  return TRAIT_SIGNATURE_MOVES[top] ?? TRAIT_SIGNATURE_MOVES.brave;
}

// ── Card number generator ────────────────────────────────────────────────────
let cardCounter = 0;
function generateCardNumber(): string {
  cardCounter++;
  const year = new Date().getFullYear();
  const num = String(cardCounter).padStart(6, '0');
  return `POKE-${year}-${num}`;
}

// ── Power Score ──────────────────────────────────────────────────────────────
function calculatePowerScore(pokemon: Pokemon, profile: PersonalityProfile, score: number): number {
  const statBonus = Math.round(pokemon.baseStatTotal / 10);
  const profileStrength = Math.round(
    Object.values(profile.traits).reduce((a, b) => a + b, 0) / 5
  );
  return Math.min(9999, statBonus + profileStrength + Math.round(score / 5));
}

// ── Main card generator ──────────────────────────────────────────────────────
export function generateCard(params: {
  trainerName: string;
  answers: QuizAnswers;
  matchedPokemon: Pokemon;
  buddy: Pokemon | null;
  profile: PersonalityProfile;
  matchScore: number;
  favoriteWon: boolean;
  aiData: AICardData | null;
  overrideRarity?: RarityTier;
}): GeneratedCard {
  const {
    trainerName, answers, matchedPokemon, buddy,
    profile, matchScore, favoriteWon, aiData, overrideRarity,
  } = params;

  const rarity = overrideRarity ?? calculateRarity(
    matchScore,
    profile,
    matchedPokemon.isLegendary,
    matchedPokemon.isMythical,
  );

  const derivedStats = calculateDerivedStats(profile);

  return {
    id: uuidv4(),
    cardNumber: generateCardNumber(),
    generatedAt: new Date().toISOString(),
    trainerName,
    buddy,
    matchedPokemon,
    matchScore,
    favoriteWon,
    personality: profile,
    answers,
    xpLevel: calculateXP(profile),
    friendshipLevel: calculateFriendship(answers, profile),
    powerScore: calculatePowerScore(matchedPokemon, profile, matchScore),
    ...derivedStats,
    rarity,
    signatureMove: selectSignatureMove(profile),
    aiData,
  };
}
