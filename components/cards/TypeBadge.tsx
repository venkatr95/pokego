'use client';

import { motion } from 'framer-motion';
import { TYPE_COLORS } from '@/types/pokemon';
import type { PokemonTypeName } from '@/types/pokemon';

interface TypeBadgeProps {
  type: PokemonTypeName;
  small?: boolean;
  tiny?: boolean;
}

const TYPE_ICONS: Record<PokemonTypeName, string> = {
  normal: '⬜', fire: '🔥', water: '💧', electric: '⚡', grass: '🌿',
  ice: '❄️', fighting: '👊', poison: '☠️', ground: '🌍', flying: '🦅',
  psychic: '🔮', bug: '🐛', rock: '🪨', ghost: '👻', dragon: '🐉',
  dark: '🌑', steel: '⚙️', fairy: '✨',
};

export function TypeBadge({ type, small = false, tiny = false }: TypeBadgeProps) {
  const tc = TYPE_COLORS[type];
  const sizeClass = tiny
    ? 'px-1.5 py-0.5 text-[8px]'
    : small
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-3 py-1 text-xs';

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`type-badge ${sizeClass} inline-flex items-center gap-1`}
      style={{
        background: tc.bg,
        color: tc.text,
        border: `1px solid ${tc.primary}40`,
        boxShadow: `0 0 8px ${tc.glow}`,
      }}
    >
      {!tiny && <span className="text-[9px]">{TYPE_ICONS[type]}</span>}
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </motion.span>
  );
}
