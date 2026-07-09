// ============================================================
// Pokémon Type Definitions
// ============================================================

export type PokemonTypeName =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface PokemonType {
  slot: number;
  type: {
    name: PokemonTypeName;
    url: string;
  };
}

export interface PokemonStat {
  name: string;
  base_stat: number;
  effort: number;
}

export interface PokemonAbility {
  name: string;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  official_artwork: string | null;
  official_artwork_shiny: string | null;
}

export interface Pokemon {
  id: number;
  name: string;
  displayName: string; // Capitalized, formatted name
  types: PokemonTypeName[];
  primaryType: PokemonTypeName;
  species: string;
  height: number; // in decimetres
  weight: number; // in hectograms
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  color: string;
  generation: number;
  description: string;
  habitat: string | null;
  evolutionStage: number; // 1 = base, 2 = stage 1, 3 = stage 2
  isLegendary: boolean;
  isMythical: boolean;
  baseStatTotal: number;
  weaknesses: PokemonTypeName[];
  resistances: PokemonTypeName[];
}

export interface PokemonSearchResult {
  id: number;
  name: string;
  displayName: string;
  types: PokemonTypeName[];
  primaryType: PokemonTypeName;
  sprite: string | null;
}

// Type theme colors for UI adaptation
export const TYPE_COLORS: Record<PokemonTypeName, { primary: string; secondary: string; bg: string; text: string; glow: string }> = {
  normal:   { primary: '#A8A878', secondary: '#C6C6A7', bg: 'rgba(168,168,120,0.15)', text: '#d4d4aa', glow: 'rgba(168,168,120,0.4)' },
  fire:     { primary: '#F08030', secondary: '#FF7C35', bg: 'rgba(240,128,48,0.15)',  text: '#ff9d5c', glow: 'rgba(240,128,48,0.5)'  },
  water:    { primary: '#6890F0', secondary: '#39DEFF', bg: 'rgba(104,144,240,0.15)', text: '#7eb8ff', glow: 'rgba(104,144,240,0.5)' },
  electric: { primary: '#F8D030', secondary: '#FFE14D', bg: 'rgba(248,208,48,0.15)',  text: '#ffe566', glow: 'rgba(248,208,48,0.5)'  },
  grass:    { primary: '#78C850', secondary: '#5FBE2C', bg: 'rgba(120,200,80,0.15)',  text: '#90d860', glow: 'rgba(120,200,80,0.5)'  },
  ice:      { primary: '#98D8D8', secondary: '#7FDDDD', bg: 'rgba(152,216,216,0.15)', text: '#b8eeee', glow: 'rgba(152,216,216,0.5)' },
  fighting: { primary: '#C03028', secondary: '#FF5144', bg: 'rgba(192,48,40,0.15)',   text: '#ff7060', glow: 'rgba(192,48,40,0.5)'   },
  poison:   { primary: '#A040A0', secondary: '#C94FC9', bg: 'rgba(160,64,160,0.15)',  text: '#d070d0', glow: 'rgba(160,64,160,0.5)'  },
  ground:   { primary: '#E0C068', secondary: '#DAB558', bg: 'rgba(224,192,104,0.15)', text: '#f0d888', glow: 'rgba(224,192,104,0.4)' },
  flying:   { primary: '#A890F0', secondary: '#9180C4', bg: 'rgba(168,144,240,0.15)', text: '#c8b8ff', glow: 'rgba(168,144,240,0.5)' },
  psychic:  { primary: '#F85888', secondary: '#FF6393', bg: 'rgba(248,88,136,0.15)',  text: '#ff7da8', glow: 'rgba(248,88,136,0.5)'  },
  bug:      { primary: '#A8B820', secondary: '#BACE10', bg: 'rgba(168,184,32,0.15)',  text: '#c8d840', glow: 'rgba(168,184,32,0.4)'  },
  rock:     { primary: '#B8A038', secondary: '#D1B941', bg: 'rgba(184,160,56,0.15)',  text: '#d4bc50', glow: 'rgba(184,160,56,0.4)'  },
  ghost:    { primary: '#705898', secondary: '#9969CF', bg: 'rgba(112,88,152,0.15)',  text: '#a080c8', glow: 'rgba(112,88,152,0.5)'  },
  dragon:   { primary: '#7038F8', secondary: '#9558FF', bg: 'rgba(112,56,248,0.15)',  text: '#a878ff', glow: 'rgba(112,56,248,0.5)'  },
  dark:     { primary: '#705848', secondary: '#997355', bg: 'rgba(112,88,72,0.15)',   text: '#c09060', glow: 'rgba(112,88,72,0.4)'   },
  steel:    { primary: '#B8B8D0', secondary: '#D1D1E0', bg: 'rgba(184,184,208,0.15)', text: '#d8d8f0', glow: 'rgba(184,184,208,0.4)' },
  fairy:    { primary: '#EE99AC', secondary: '#F4BDC9', bg: 'rgba(238,153,172,0.15)', text: '#ffb8c8', glow: 'rgba(238,153,172,0.5)' },
};
