// ============================================================
// Quiz & Personality Type Definitions
// ============================================================

export type QuizStep = 'name' | 'favorite-pokemon' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'complete';

export interface QuizQuestion {
  id: QuizStep;
  question: string;
  type: 'text' | 'pokemon-search' | 'choice';
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  label: string;
  icon?: string;
  traits: PersonalityTrait[];
}

export interface QuizAnswers {
  name: string;
  favoritePokemonId: number | null;
  favoritePokemonName: string | null;
  q1: string | null; // Problem solving style
  q2: string | null; // Preferred environment
  q3: string | null; // Motivation
  q4: string | null; // Personality type
  q5: string | null; // How friends describe you
}

export type PersonalityTrait =
  | 'brave' | 'curious' | 'calm' | 'loyal' | 'energetic'
  | 'creative' | 'strategic' | 'protective' | 'funny' | 'determined'
  | 'adventurous' | 'knowledgeable' | 'social' | 'powerful' | 'competitive'
  | 'reliable' | 'kind' | 'mysterious' | 'playful' | 'stoic';

export interface PersonalityProfile {
  traits: Record<PersonalityTrait, number>;
  dominantTraits: PersonalityTrait[];
  battleStyle: string;
  trainerArchetype: string;
}

export type RarityTier =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Mythic'
  | 'Shiny'
  | 'Secret Rare';

export interface RarityConfig {
  tier: RarityTier;
  color: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  particleCount: number;
  holographicIntensity: number; // 0-1
}

export const RARITY_CONFIGS: Record<RarityTier, RarityConfig> = {
  'Common':      { tier: 'Common',      color: '#9ca3af', gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)', borderColor: '#9ca3af', glowColor: 'rgba(156,163,175,0.3)',  particleCount: 0,   holographicIntensity: 0 },
  'Uncommon':    { tier: 'Uncommon',    color: '#34d399', gradient: 'linear-gradient(135deg, #059669, #34d399)', borderColor: '#34d399', glowColor: 'rgba(52,211,153,0.4)',   particleCount: 10,  holographicIntensity: 0.2 },
  'Rare':        { tier: 'Rare',        color: '#60a5fa', gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderColor: '#60a5fa', glowColor: 'rgba(96,165,250,0.5)',   particleCount: 20,  holographicIntensity: 0.4 },
  'Epic':        { tier: 'Epic',        color: '#a78bfa', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)', borderColor: '#a78bfa', glowColor: 'rgba(167,139,250,0.6)',  particleCount: 30,  holographicIntensity: 0.6 },
  'Legendary':   { tier: 'Legendary',   color: '#fbbf24', gradient: 'linear-gradient(135deg, #d97706, #fbbf24)', borderColor: '#fbbf24', glowColor: 'rgba(251,191,36,0.7)',   particleCount: 50,  holographicIntensity: 0.8 },
  'Mythic':      { tier: 'Mythic',      color: '#f472b6', gradient: 'linear-gradient(135deg, #db2777, #f472b6)', borderColor: '#f472b6', glowColor: 'rgba(244,114,182,0.8)',  particleCount: 60,  holographicIntensity: 0.9 },
  'Shiny':       { tier: 'Shiny',       color: '#e5e7eb', gradient: 'linear-gradient(135deg, #d4af37, #fff, #d4af37)', borderColor: '#d4af37', glowColor: 'rgba(212,175,55,0.8)', particleCount: 80,  holographicIntensity: 1 },
  'Secret Rare': { tier: 'Secret Rare', color: '#ff6b6b', gradient: 'linear-gradient(135deg, #ff0080, #ff6b6b, #ffd700)', borderColor: '#ff0080', glowColor: 'rgba(255,0,128,0.9)', particleCount: 100, holographicIntensity: 1 },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'name',
    question: "What's your Trainer name?",
    type: 'text',
  },
  {
    id: 'favorite-pokemon',
    question: 'Choose your Buddy Pokémon',
    type: 'pokemon-search',
  },
  {
    id: 'q1',
    question: 'How do you solve problems?',
    type: 'choice',
    options: [
      { id: 'carefully',      label: 'Carefully',      icon: '🧠', traits: ['strategic', 'calm', 'knowledgeable'] },
      { id: 'instinctively',  label: 'Instinctively',  icon: '⚡', traits: ['brave', 'energetic', 'adventurous'] },
      { id: 'collaboratively',label: 'Collaboratively', icon: '🤝', traits: ['social', 'loyal', 'kind'] },
      { id: 'experimentally', label: 'Experimentally', icon: '🔬', traits: ['curious', 'creative', 'playful'] },
    ],
  },
  {
    id: 'q2',
    question: 'Where would you rather live?',
    type: 'choice',
    options: [
      { id: 'ocean',     label: 'Ocean',     icon: '🌊', traits: ['calm', 'mysterious', 'adventurous'] },
      { id: 'mountains', label: 'Mountains', icon: '🏔️', traits: ['stoic', 'determined', 'powerful'] },
      { id: 'forest',    label: 'Forest',    icon: '🌲', traits: ['protective', 'loyal', 'kind'] },
      { id: 'city',      label: 'City',      icon: '🏙️', traits: ['competitive', 'energetic', 'social'] },
      { id: 'sky',       label: 'Sky',       icon: '☁️', traits: ['adventurous', 'brave', 'curious'] },
    ],
  },
  {
    id: 'q3',
    question: 'What motivates you most?',
    type: 'choice',
    options: [
      { id: 'adventure',  label: 'Adventure',          icon: '🗺️', traits: ['adventurous', 'brave', 'curious'] },
      { id: 'knowledge',  label: 'Knowledge',          icon: '📚', traits: ['knowledgeable', 'curious', 'strategic'] },
      { id: 'friendship', label: 'Friendship',         icon: '💞', traits: ['loyal', 'kind', 'social'] },
      { id: 'power',      label: 'Power',              icon: '💪', traits: ['powerful', 'competitive', 'determined'] },
      { id: 'protecting', label: 'Protecting others',  icon: '🛡️', traits: ['protective', 'loyal', 'brave'] },
    ],
  },
  {
    id: 'q4',
    question: 'Which personality fits you best?',
    type: 'choice',
    options: [
      { id: 'calm',        label: 'Calm',        icon: '😌', traits: ['calm', 'stoic', 'strategic'] },
      { id: 'energetic',   label: 'Energetic',   icon: '⚡', traits: ['energetic', 'playful', 'adventurous'] },
      { id: 'curious',     label: 'Curious',     icon: '🔍', traits: ['curious', 'knowledgeable', 'creative'] },
      { id: 'loyal',       label: 'Loyal',       icon: '🤝', traits: ['loyal', 'protective', 'reliable'] },
      { id: 'competitive', label: 'Competitive', icon: '🏆', traits: ['competitive', 'determined', 'powerful'] },
    ],
  },
  {
    id: 'q5',
    question: 'Your friends would describe you as...',
    type: 'choice',
    options: [
      { id: 'funny',    label: 'Funny',    icon: '😄', traits: ['playful', 'social', 'energetic'] },
      { id: 'brave',    label: 'Brave',    icon: '⚔️', traits: ['brave', 'determined', 'powerful'] },
      { id: 'reliable', label: 'Reliable', icon: '🔒', traits: ['reliable', 'loyal', 'protective'] },
      { id: 'creative', label: 'Creative', icon: '🎨', traits: ['creative', 'curious', 'playful'] },
      { id: 'kind',     label: 'Kind',     icon: '💖', traits: ['kind', 'social', 'loyal'] },
    ],
  },
];
