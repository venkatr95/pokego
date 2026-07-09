// ============================================================
// Card Background — Procedural CSS/SVG backgrounds
// 10 environment themes matched to Pokémon type + personality
// ============================================================

export type EnvironmentTheme =
  | 'stormy-mountain'
  | 'cherry-blossom'
  | 'volcano'
  | 'crystal-cave'
  | 'cyberpunk-city'
  | 'aurora-sky'
  | 'deep-ocean'
  | 'haunted-castle'
  | 'space-galaxy'
  | 'ancient-temple';

export interface BackgroundConfig {
  id: EnvironmentTheme;
  name: string;
  emoji: string;
  /** CSS gradient layers */
  gradient: string;
  /** SVG pattern overlay */
  svgPattern?: string;
  /** Particle color */
  particleColor: string;
  /** Atmospheric color */
  atmosphereColor: string;
}

export const ENVIRONMENT_BACKGROUNDS: Record<EnvironmentTheme, BackgroundConfig> = {
  'stormy-mountain': {
    id: 'stormy-mountain',
    name: 'Stormy Mountain',
    emoji: '⛰️',
    gradient: `
      radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(67, 56, 202, 0.3) 0%, transparent 50%),
      linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)
    `,
    particleColor: 'rgba(129, 140, 248, 0.8)',
    atmosphereColor: '#4338ca',
  },
  'cherry-blossom': {
    id: 'cherry-blossom',
    name: 'Cherry Blossom Forest',
    emoji: '🌸',
    gradient: `
      radial-gradient(ellipse at 30% 20%, rgba(252, 165, 165, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(251, 207, 232, 0.3) 0%, transparent 50%),
      linear-gradient(180deg, #1a0a0a 0%, #2d0a1a 40%, #1a0a10 100%)
    `,
    particleColor: 'rgba(251, 113, 133, 0.9)',
    atmosphereColor: '#f43f5e',
  },
  'volcano': {
    id: 'volcano',
    name: 'Volcano',
    emoji: '🌋',
    gradient: `
      radial-gradient(ellipse at 50% 70%, rgba(239, 68, 68, 0.6) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 40%, rgba(245, 158, 11, 0.4) 0%, transparent 40%),
      linear-gradient(180deg, #0a0000 0%, #1a0000 40%, #2a0500 100%)
    `,
    particleColor: 'rgba(251, 146, 60, 0.9)',
    atmosphereColor: '#ef4444',
  },
  'crystal-cave': {
    id: 'crystal-cave',
    name: 'Crystal Cave',
    emoji: '💎',
    gradient: `
      radial-gradient(ellipse at 40% 30%, rgba(147, 197, 253, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 70%, rgba(196, 181, 253, 0.3) 0%, transparent 50%),
      linear-gradient(180deg, #0a0010 0%, #0d001a 50%, #050010 100%)
    `,
    particleColor: 'rgba(147, 197, 253, 0.8)',
    atmosphereColor: '#3b82f6',
  },
  'cyberpunk-city': {
    id: 'cyberpunk-city',
    name: 'Cyberpunk City',
    emoji: '🌆',
    gradient: `
      radial-gradient(ellipse at 50% 0%, rgba(236, 72, 153, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 60%, rgba(6, 182, 212, 0.3) 0%, transparent 40%),
      radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 40%),
      linear-gradient(180deg, #020010 0%, #0a001a 50%, #050010 100%)
    `,
    particleColor: 'rgba(236, 72, 153, 0.8)',
    atmosphereColor: '#a855f7',
  },
  'aurora-sky': {
    id: 'aurora-sky',
    name: 'Aurora Sky',
    emoji: '🌌',
    gradient: `
      radial-gradient(ellipse at 30% 40%, rgba(52, 211, 153, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 30%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 70%, rgba(251, 113, 133, 0.2) 0%, transparent 40%),
      linear-gradient(180deg, #000a0f 0%, #000d14 100%)
    `,
    particleColor: 'rgba(52, 211, 153, 0.8)',
    atmosphereColor: '#10b981',
  },
  'deep-ocean': {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    emoji: '🌊',
    gradient: `
      radial-gradient(ellipse at 50% 30%, rgba(6, 182, 212, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 80%, rgba(37, 99, 235, 0.4) 0%, transparent 50%),
      linear-gradient(180deg, #000814 0%, #001020 50%, #000814 100%)
    `,
    particleColor: 'rgba(6, 182, 212, 0.8)',
    atmosphereColor: '#0ea5e9',
  },
  'haunted-castle': {
    id: 'haunted-castle',
    name: 'Haunted Castle',
    emoji: '🏰',
    gradient: `
      radial-gradient(ellipse at 50% 20%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 70%, rgba(109, 40, 217, 0.4) 0%, transparent 50%),
      linear-gradient(180deg, #020006 0%, #0a0014 60%, #04000a 100%)
    `,
    particleColor: 'rgba(167, 139, 250, 0.8)',
    atmosphereColor: '#7c3aed',
  },
  'space-galaxy': {
    id: 'space-galaxy',
    name: 'Space Galaxy',
    emoji: '🌠',
    gradient: `
      radial-gradient(ellipse at 40% 40%, rgba(168, 85, 247, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 60%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 40%),
      linear-gradient(180deg, #000005 0%, #040010 100%)
    `,
    particleColor: 'rgba(196, 181, 253, 0.9)',
    atmosphereColor: '#8b5cf6',
  },
  'ancient-temple': {
    id: 'ancient-temple',
    name: 'Ancient Temple',
    emoji: '🏛️',
    gradient: `
      radial-gradient(ellipse at 50% 20%, rgba(245, 158, 11, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 70%, rgba(180, 83, 9, 0.4) 0%, transparent 50%),
      linear-gradient(180deg, #0a0600 0%, #140c00 60%, #0a0600 100%)
    `,
    particleColor: 'rgba(251, 191, 36, 0.8)',
    atmosphereColor: '#d97706',
  },
};

// Map Pokémon type to best environment theme
const TYPE_TO_ENVIRONMENT: Record<string, EnvironmentTheme> = {
  fire: 'volcano',
  water: 'deep-ocean',
  grass: 'cherry-blossom',
  electric: 'cyberpunk-city',
  ice: 'aurora-sky',
  fighting: 'stormy-mountain',
  poison: 'haunted-castle',
  ground: 'ancient-temple',
  flying: 'aurora-sky',
  psychic: 'crystal-cave',
  bug: 'cherry-blossom',
  rock: 'stormy-mountain',
  ghost: 'haunted-castle',
  dragon: 'volcano',
  dark: 'haunted-castle',
  steel: 'crystal-cave',
  fairy: 'aurora-sky',
  normal: 'space-galaxy',
};

export function getEnvironmentForType(type: string): EnvironmentTheme {
  return TYPE_TO_ENVIRONMENT[type.toLowerCase()] ?? 'space-galaxy';
}
