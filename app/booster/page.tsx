'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useQuizStore } from '@/store/quiz-store';
import { PokemonCard } from '@/components/cards/PokemonCard';
import { RarityBadge } from '@/components/cards/RarityBadge';
import { TYPE_COLORS } from '@/types/pokemon';
import { Sparkles, Zap, RotateCcw, Package } from 'lucide-react';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

type PackPhase =
  | 'idle'        // Ready to open
  | 'shake'       // Shaking the pack
  | 'tear'        // Tearing animation
  | 'flip'        // Card flip reveal
  | 'revealed';   // Final state

const PACK_COLORS = {
  'Secret Rare': ['#ff0080', '#ffd700', '#ff6b6b'],
  'Mythic':      ['#db2777', '#f472b6', '#c084fc'],
  'Legendary':   ['#d97706', '#fbbf24', '#fde68a'],
  'Shiny':       ['#d4af37', '#ffffff', '#c0a030'],
  'Epic':        ['#7c3aed', '#a78bfa', '#c4b5fd'],
  'Rare':        ['#2563eb', '#60a5fa', '#93c5fd'],
  'Uncommon':    ['#059669', '#34d399', '#6ee7b7'],
  'Common':      ['#6b7280', '#9ca3af', '#d1d5db'],
};

const RARITY_LABELS = {
  'Secret Rare': { label: '🌈 SECRET RARE!', glow: '#ff0080' },
  'Mythic':      { label: '✨ MYTHIC!', glow: '#f472b6' },
  'Legendary':   { label: '⚡ LEGENDARY!', glow: '#fbbf24' },
  'Shiny':       { label: '✦ SHINY!', glow: '#d4af37' },
  'Epic':        { label: '💜 EPIC!', glow: '#a78bfa' },
  'Rare':        { label: '💙 RARE!', glow: '#60a5fa' },
  'Uncommon':    { label: '💚 UNCOMMON', glow: '#34d399' },
  'Common':      { label: '🃏 COMMON', glow: '#9ca3af' },
};

function PackWrapper({ rarity, colors }: { rarity: string; colors: string[] }) {
  return (
    <div
      className="relative w-64 h-96 rounded-2xl overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        boxShadow: `0 0 60px ${colors[0]}80, 0 20px 60px rgba(0,0,0,0.6)`,
        border: `2px solid ${colors[1]}60`,
      }}
    >
      {/* Holographic sheen */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(255,255,255,0.1) 60%, transparent 100%)',
          animation: 'holographic 3s linear infinite',
          backgroundSize: '400% 400%',
        }}
      />
      {/* Logo area */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center">
        <div className="text-foreground font-bold text-xl tracking-wider drop-shadow-lg">POKÉYOU</div>
        <div className="text-foreground/70 text-xs tracking-widest mt-1">PERSONALITY SERIES</div>
      </div>
      {/* Pokeball icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center"
          style={{ boxShadow: `0 0 30px ${colors[0]}80` }}
        >
          <div className="text-4xl">⭐</div>
        </div>
      </div>
      {/* Rarity label */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span
          className="text-xs font-bold tracking-widest text-foreground uppercase px-3 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          {rarity}
        </span>
      </div>
      {/* Particle overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: colors[i % colors.length],
              left: `${15 + (i * 12)}%`,
              top: `${10 + (i * 10)}%`,
            }}
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function BoosterPackPage() {
  const router = useRouter();
  const { generatedCard } = useQuizStore();
  const [phase, setPhase] = useState<PackPhase>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const handleOpen = useCallback(async () => {
    if (!generatedCard || phase !== 'idle') return;
    setPhase('shake');
    await new Promise(r => setTimeout(r, 800));
    setPhase('tear');
    await new Promise(r => setTimeout(r, 600));
    setPhase('flip');
    await new Promise(r => setTimeout(r, 1200));
    setPhase('revealed');
    const isRare = ['Secret Rare', 'Mythic', 'Legendary', 'Shiny', 'Epic'].includes(generatedCard.rarity);
    if (isRare) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    }
  }, [generatedCard, phase]);

  const handleReset = () => setPhase('idle');

  if (!generatedCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-6xl mb-4">📦</div>
        <h1 className="font-display text-2xl font-bold text-foreground text-center">No Card to Open!</h1>
        <p className="text-foreground/50 text-center">Take the personality quiz first to get your Pokémon card.</p>
        <button
          onClick={() => router.push('/quiz/name')}
          className="btn-primary flex items-center gap-2"
        >
          <Zap className="w-4 h-4" /> Take the Quiz
        </button>
      </div>
    );
  }

  const pokemon = generatedCard.matchedPokemon;
  const typeTheme = TYPE_COLORS[pokemon.primaryType];
  const colors = PACK_COLORS[generatedCard.rarity] ?? PACK_COLORS['Common'];
  const rarityInfo = RARITY_LABELS[generatedCard.rarity] ?? RARITY_LABELS['Common'];
  const isRare = ['Secret Rare', 'Mythic', 'Legendary', 'Shiny', 'Epic'].includes(generatedCard.rarity);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at top, ${typeTheme.bg} 0%, #0a0b0f 60%)` }}
    >
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={400}
          gravity={0.1}
          colors={[...colors, '#ffffff']}
          recycle={false}
        />
      )}

      {/* Background glow */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: colors[0], opacity: 0.15 }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 glass border border-white/10 rounded-full px-4 py-2 text-sm text-foreground/60 mb-4">
            <Package className="w-3.5 h-3.5" /> Booster Pack Opening
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {phase === 'revealed' ? `You Got ${pokemon.displayName}!` : 'Open Your Pack'}
          </h1>
          {phase === 'idle' && (
            <p className="text-foreground/50 mt-2">Tap the pack to reveal your card!</p>
          )}
        </motion.div>

        {/* Pack / Card area */}
        <div className="relative flex items-center justify-center" style={{ minHeight: '420px' }}>
          <AnimatePresence mode="wait">
            {phase === 'idle' && (
              <motion.button
                key="pack-idle"
                onClick={handleOpen}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer"
                id="open-pack-button"
              >
                <PackWrapper rarity={generatedCard.rarity} colors={colors} />
                <p className="text-center text-foreground/40 text-sm mt-4 animate-pulse">
                  Tap to open ✨
                </p>
              </motion.button>
            )}

            {phase === 'shake' && (
              <motion.div
                key="pack-shake"
                animate={{ x: [-8, 8, -6, 6, -4, 4, 0], rotate: [-3, 3, -2, 2, -1, 1, 0] }}
                transition={{ duration: 0.8, ease: 'linear' }}
              >
                <PackWrapper rarity={generatedCard.rarity} colors={colors} />
                <p className="text-center text-foreground/60 text-sm mt-4">Opening…</p>
              </motion.div>
            )}

            {phase === 'tear' && (
              <motion.div
                key="pack-tear"
                className="relative"
                animate={{ y: [-10, -5, -15], opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.6 }}
              >
                <PackWrapper rarity={generatedCard.rarity} colors={colors} />
                {/* Tear particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-5 rounded"
                    style={{
                      background: colors[i % colors.length],
                      left: `${10 + i * 7}%`,
                      top: '40%',
                    }}
                    animate={{
                      x: (i % 2 === 0 ? -1 : 1) * (20 + i * 8),
                      y: [0, 30 + i * 5],
                      rotate: i * 25,
                      opacity: [1, 0],
                    }}
                    transition={{ duration: 0.6, delay: i * 0.03 }}
                  />
                ))}
              </motion.div>
            )}

            {(phase === 'flip' || phase === 'revealed') && (
              <motion.div
                key="card-reveal"
                initial={{ rotateY: 180, opacity: 0, scale: 0.7 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
              >
                <PokemonCard card={generatedCard} interactive={phase === 'revealed'} />

                {/* Glow ring for rare cards */}
                {isRare && (
                  <motion.div
                    className="absolute inset-0 rounded-[20px] pointer-events-none"
                    animate={{ boxShadow: [
                      `0 0 30px ${colors[0]}80`,
                      `0 0 60px ${colors[0]}c0`,
                      `0 0 30px ${colors[0]}80`,
                    ] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rarity reveal label */}
        <AnimatePresence>
          {phase === 'revealed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="text-center"
            >
              <p
                className="font-display text-2xl font-bold"
                style={{ textShadow: `0 0 20px ${rarityInfo.glow}` }}
              >
                {rarityInfo.label}
              </p>
              <RarityBadge rarity={generatedCard.rarity} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions after reveal */}
        <AnimatePresence>
          {phase === 'revealed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 w-full max-w-sm"
            >
              <button
                onClick={() => router.push('/card')}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> View Full Card
              </button>
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground transition-all text-sm"
              >
                <RotateCcw className="w-4 h-4" /> Open Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
