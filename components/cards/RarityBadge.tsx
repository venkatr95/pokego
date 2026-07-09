'use client';

import { motion } from 'framer-motion';
import { RARITY_CONFIGS } from '@/types/quiz';
import type { RarityTier } from '@/types/quiz';
import { Star } from 'lucide-react';

interface RarityBadgeProps {
  rarity: RarityTier;
  small?: boolean;
}

const RARITY_ICONS: Record<RarityTier, string> = {
  'Common':      '⬜',
  'Uncommon':    '🟢',
  'Rare':        '🔵',
  'Epic':        '🟣',
  'Legendary':   '⭐',
  'Mythic':      '💫',
  'Shiny':       '✨',
  'Secret Rare': '🌟',
};

export function RarityBadge({ rarity, small = false }: RarityBadgeProps) {
  const config = RARITY_CONFIGS[rarity];

  const rarityClass = rarity === 'Secret Rare'
    ? 'rarity-secret-rare'
    : rarity === 'Mythic'
    ? 'rarity-mythic'
    : rarity === 'Legendary'
    ? 'rarity-legendary'
    : '';

  if (small) {
    return (
      <motion.span
        whileHover={{ scale: 1.1 }}
        className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${rarityClass}`}
        style={!rarityClass ? { color: config.color, background: config.color + '20', border: `1px solid ${config.color}40` } : { background: 'rgba(0,0,0,0.3)' }}
      >
        {RARITY_ICONS[rarity]} {rarity}
      </motion.span>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl"
      style={{
        background: config.gradient,
        boxShadow: `0 0 20px ${config.glowColor}, 0 0 40px ${config.glowColor}60`,
        border: `1px solid ${config.borderColor}60`,
      }}
    >
      <Star className="w-4 h-4" style={{ color: config.color === '#e5e7eb' ? '#fff' : config.color }} />
      <span
        className={`font-bold text-sm tracking-wide ${rarityClass}`}
        style={!rarityClass ? { color: 'white' } : {}}
      >
        {rarity}
      </span>
      <span className="text-lg">{RARITY_ICONS[rarity]}</span>
    </motion.div>
  );
}
