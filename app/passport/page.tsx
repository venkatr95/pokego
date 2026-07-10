'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { TYPE_COLORS } from '@/types/pokemon';
import { getTrainerRank } from '@/types/card';
import { generateCardSlug } from '@/lib/utils/seo';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Zap } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

const REGIONS = [
  { name: 'Kanto', id_range: [1, 151], emoji: '🏔️' },
  { name: 'Johto', id_range: [152, 251], emoji: '🌿' },
  { name: 'Hoenn', id_range: [252, 386], emoji: '🌊' },
  { name: 'Sinnoh', id_range: [387, 493], emoji: '❄️' },
  { name: 'Unova', id_range: [494, 649], emoji: '🌆' },
  { name: 'Kalos', id_range: [650, 721], emoji: '🗼' },
  { name: 'Alola', id_range: [722, 809], emoji: '🌺' },
  { name: 'Galar', id_range: [810, 905], emoji: '🏰' },
  { name: 'Paldea', id_range: [906, 1025], emoji: '🌄' },
];

function getRegionForPokemon(id: number) {
  return REGIONS.find(r => id >= r.id_range[0] && id <= r.id_range[1]) ?? REGIONS[0];
}

const LEAGUE_RANKS = [
  { label: 'Rookie', minXP: 0, icon: '🌱', color: '#9ca3af' },
  { label: 'Ace Trainer', minXP: 20, icon: '⭐', color: '#60a5fa' },
  { label: 'Gym Challenger', minXP: 40, icon: '🏅', color: '#34d399' },
  { label: 'Gym Leader', minXP: 55, icon: '🏆', color: '#fbbf24' },
  { label: 'Elite Four', minXP: 70, icon: '💫', color: '#a78bfa' },
  { label: 'Champion', minXP: 85, icon: '👑', color: '#f472b6' },
  { label: 'Pokémon Master', minXP: 96, icon: '🌟', color: '#ff0080' },
];

function getLeagueRank(xp: number) {
  return [...LEAGUE_RANKS].reverse().find(r => xp >= r.minXP) ?? LEAGUE_RANKS[0];
}

export default function PassportPage() {
  const router = useRouter();
  const { generatedCard } = useQuizStore();
  const passportRef = useRef<HTMLDivElement>(null);

  if (!generatedCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-6xl mb-4">🪪</div>
        <h1 className="font-display text-2xl font-bold text-foreground text-center">No Trainer Passport Found</h1>
        <p className="text-foreground/50 text-center">Complete the personality quiz to generate your Trainer Passport.</p>
        <button onClick={() => router.push('/quiz/name')} className="btn-primary flex items-center gap-2">
          <Zap className="w-4 h-4" /> Take the Quiz
        </button>
      </div>
    );
  }

  const pokemon = generatedCard.matchedPokemon;
  const typeTheme = TYPE_COLORS[pokemon.primaryType];
  const trainerRank = getTrainerRank(generatedCard.xpLevel);
  const leagueRank = getLeagueRank(generatedCard.xpLevel);
  const region = generatedCard.aiData?.region
    ? REGIONS.find(r => r.name === generatedCard.aiData!.region) ?? getRegionForPokemon(pokemon.id)
    : getRegionForPokemon(pokemon.id);
  const artUrl = pokemon.sprites.official_artwork
    ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  const buddyArtUrl = generatedCard.buddy
    ? (generatedCard.buddy.sprites.official_artwork ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${generatedCard.buddy.id}.png`)
    : null;

  const slug = generateCardSlug(pokemon.name, generatedCard.id);
  const cardUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/card/${slug}`
    : '';

  const handleDownload = async () => {
    if (!passportRef.current) return;
    try {
      const dataUrl = await toPng(passportRef.current, { quality: 1, pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${generatedCard.trainerName}-passport.png`;
      a.click();
    } catch { /* ignore */ }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-16 relative"
      style={{ background: `radial-gradient(ellipse at top, ${typeTheme.bg} 0%, #0a0b0f 60%)` }}
    >
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 glass border border-white/10 rounded-full px-4 py-2 text-sm text-foreground/60 mb-4">
            🪪 Trainer Passport
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Digital Trainer ID</h1>
          <p className="text-foreground/50 mt-2">Your official Pokémon League credentials</p>
        </motion.div>

        {/* Passport document */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            ref={passportRef}
            className="rounded-3xl overflow-hidden"
            style={{
              background: '#0f1117',
              border: `2px solid ${typeTheme.primary}40`,
              boxShadow: `0 30px 80px rgba(0,0,0,0.8), 0 0 40px ${typeTheme.glow}`,
            }}
          >
            {/* Passport header strip */}
            <div
              className="px-8 py-5 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${typeTheme.primary}30, ${typeTheme.secondary}15)` }}
            >
              <div>
                <p className="text-xs text-foreground/40 uppercase tracking-widest">Pokémon League</p>
                <p className="font-display text-xl font-bold text-foreground">TRAINER PASSPORT</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-foreground/40">Issue Date</p>
                <p className="text-sm text-foreground/70 font-mono">
                  {new Date(generatedCard.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Main passport body */}
            <div className="p-8">
              {/* Photo + Basic Info */}
              <div className="flex gap-6 mb-8">
                {/* Avatar / Pokémon photo */}
                <div
                  className="w-32 h-40 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 relative"
                  style={{ background: typeTheme.bg, border: `2px solid ${typeTheme.primary}40` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artUrl}
                    alt={pokemon.displayName}
                    className="w-28 h-28 object-contain"
                    style={{ filter: `drop-shadow(0 4px 12px ${typeTheme.glow})` }}
                  />
                  {/* League rank badge */}
                  <div
                    className="absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: leagueRank.color, color: 'white', fontSize: '10px' }}
                  >
                    {leagueRank.icon}
                  </div>
                </div>

                {/* Info fields */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-foreground/30 uppercase tracking-wider">Full Name</p>
                      <p className="text-foreground font-bold text-lg leading-tight">{generatedCard.trainerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-foreground/30 uppercase tracking-wider">Trainer ID</p>
                      <p className="text-foreground/70 font-mono text-sm">{generatedCard.id.slice(0, 12).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-foreground/30 uppercase tracking-wider">Title</p>
                      <p className="text-sm font-medium" style={{ color: typeTheme.text }}>
                        {generatedCard.aiData?.trainerTitle ?? trainerRank}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-foreground/30 uppercase tracking-wider">Career</p>
                      <p className="text-sm text-foreground/70">{generatedCard.aiData?.career ?? 'Trainer'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-foreground/30 uppercase tracking-wider">Home Region</p>
                      <p className="text-sm text-foreground/70">{region.emoji} {region.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-foreground/30 uppercase tracking-wider">League Rank</p>
                      <p className="text-sm font-bold" style={{ color: leagueRank.color }}>
                        {leagueRank.icon} {leagueRank.label}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-foreground/5 mb-6" />

              {/* Pokémon section */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Partner Pokémon */}
                <div>
                  <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-3">Partner Pokémon</p>
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: typeTheme.bg, border: `1px solid ${typeTheme.primary}30` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={artUrl} alt={pokemon.displayName} className="w-12 h-12 object-contain" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">{pokemon.displayName}</p>
                      <p className="text-xs text-foreground/50 capitalize">{pokemon.types.join(' / ')}</p>
                    </div>
                  </div>
                </div>

                {/* Buddy Pokémon */}
                <div>
                  <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-3">Buddy Pokémon</p>
                  {generatedCard.buddy && buddyArtUrl ? (
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={buddyArtUrl} alt={generatedCard.buddy.displayName} className="w-12 h-12 object-contain" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">{generatedCard.buddy.displayName}</p>
                        <p className="text-xs text-foreground/50 capitalize">{generatedCard.buddy.types.join(' / ')}</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center p-3 rounded-xl h-[62px]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}
                    >
                      <p className="text-xs text-foreground/30">No buddy selected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Trainer XP', value: generatedCard.xpLevel, suffix: '/100', icon: '📈' },
                  { label: 'Friendship', value: generatedCard.friendshipLevel, suffix: '/255', icon: '💖' },
                  { label: 'Power Score', value: generatedCard.powerScore.toLocaleString(), suffix: '', icon: '⚡' },
                  { label: 'Adventure', value: generatedCard.adventureScore, suffix: '/100', icon: '🗺️' },
                ].map(({ label, value, suffix, icon }) => (
                  <div
                    key={label}
                    className="text-center p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="text-lg mb-1">{icon}</div>
                    <div className="font-bold text-foreground text-sm">{value}{suffix}</div>
                    <div className="text-[10px] text-foreground/40">{label}</div>
                  </div>
                ))}
              </div>

              {/* Achievements */}
              {generatedCard.aiData?.achievements?.length ? (
                <div className="mb-6">
                  <p className="text-[10px] text-foreground/30 uppercase tracking-wider mb-3">Achievements</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedCard.aiData.achievements.map((a) => (
                      <span
                        key={a}
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.2)' }}
                      >
                        🏅 {a}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Divider */}
              <div className="h-px bg-foreground/5 mb-6" />

              {/* Passport footer: QR + card number */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-foreground/20 uppercase tracking-wider mb-2">Card Number</p>
                  <p className="font-mono text-foreground/50 text-sm">{generatedCard.cardNumber}</p>
                  <p className="font-mono text-foreground/30 text-xs mt-1">UUID: {generatedCard.id.slice(0, 8)}…</p>
                  <p className="text-[10px] text-foreground/20 mt-2">Pokémon League · Official Document</p>
                </div>
                {cardUrl && (
                  <div className="flex flex-col items-center gap-1">
                    <QRCodeSVG
                      value={cardUrl || 'https://pokeyou.app'}
                      size={72}
                      bgColor="transparent"
                      fgColor={typeTheme.primary}
                      level="M"
                    />
                    <p className="text-[9px] text-foreground/30">Scan for card</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Download button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleDownload}
          className="mt-6 w-full btn-primary flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Download Passport PNG
        </motion.button>
      </div>
    </div>
  );
}
