'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useQuizStore } from '@/store/quiz-store';
import { PokemonCard } from '@/components/cards/PokemonCard';
import { RarityBadge } from '@/components/cards/RarityBadge';
import { ThemeSelector } from '@/components/cards/ThemeSelector';
import { PersonalityRadar } from '@/components/cards/PersonalityRadar';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { TYPE_COLORS } from '@/types/pokemon';
import { ARCardPreview } from '@/components/ar/ARCardPreview';
import { generateCardSlug } from '@/lib/utils/seo';
import {
  Sparkles, RotateCcw, Palette, ChevronDown,
  Map, BookOpen, Users, Star, Printer
} from 'lucide-react';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });
const DownloadButton = dynamic(
  () => import('@/components/shared/DownloadButton').then((mod) => mod.DownloadButton),
  { ssr: false }
);

type ActiveTab = 'card' | 'personality' | 'story' | 'team';

export default function CardRevealPage() {
  const router = useRouter();
  const {
    generatedCard,
    resetQuiz,
    selectedTheme,
    setSelectedTheme,
    selectedEnvironment,
    setSelectedEnvironment,
  } = useQuizStore();

  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showARPreview, setShowARPreview] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('card');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!generatedCard) {
      router.replace('/quiz/name');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const t1 = setTimeout(() => setRevealed(true), 400);
    const t2 = setTimeout(() => setShowConfetti(true), 900);
    const t3 = setTimeout(() => setShowConfetti(false), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [generatedCard, router]);

  const handleRestart = () => { resetQuiz(); router.push('/quiz/name'); };

  if (!generatedCard) return null;

  const pokemon = generatedCard.matchedPokemon;
  const typeTheme = TYPE_COLORS[pokemon.primaryType];
  const slug = generateCardSlug(pokemon.name, generatedCard.id);
  const cardUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/card/${slug}`;

  const rarityColors = {
    'Secret Rare': { from: '#ff0080', via: '#ffd700', to: '#ff6b6b' },
    'Mythic':      { from: '#db2777', via: '#f472b6', to: '#c084fc' },
    'Legendary':   { from: '#d97706', via: '#fbbf24', to: '#fde68a' },
    'Shiny':       { from: '#d4af37', via: '#fff', to: '#d4af37' },
    'Epic':        { from: '#7c3aed', via: '#a78bfa', to: '#c4b5fd' },
    'Rare':        { from: '#2563eb', via: '#60a5fa', to: '#93c5fd' },
    'Uncommon':    { from: '#059669', via: '#34d399', to: '#6ee7b7' },
    'Common':      { from: '#6b7280', via: '#9ca3af', to: '#d1d5db' },
  }[generatedCard.rarity] ?? { from: '#6b7280', via: '#9ca3af', to: '#d1d5db' };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Card', icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'personality', label: 'Personality', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'story', label: 'Story', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-16 relative overflow-x-hidden"
      style={{ background: `radial-gradient(ellipse at top, ${typeTheme.bg} 0%, #0a0b0f 60%)` }}
    >
      {/* Confetti */}
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={generatedCard.rarity === 'Secret Rare' ? 400 : 200}
          gravity={0.15}
          colors={[typeTheme.primary, typeTheme.secondary, '#ffffff', rarityColors.from, rarityColors.to]}
          recycle={false}
        />
      )}

      {/* Ambient glow - Hidden on mobile for performance */}
      <div
        className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-25 hidden md:block"
        style={{ background: typeTheme.primary }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-6xl mx-auto w-full">
        {/* Header */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <RarityBadge rarity={generatedCard.rarity} />
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="font-display text-3xl md:text-4xl font-bold mt-6 mb-2"
              >
                Your Pokémon is{' '}
                <span style={{ color: typeTheme.text }}>{pokemon.displayName}</span>!
              </motion.h1>
              {generatedCard.aiData?.motivationalQuote && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-foreground/50 italic text-lg"
                >
                  {generatedCard.aiData.motivationalQuote}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Nav */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-1 glass rounded-2xl p-1 mb-8"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: typeTheme.bg, border: `1px solid ${typeTheme.primary}40` }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content area */}
        <AnimatePresence mode="wait">
          {revealed && activeTab === 'card' && (
            <motion.div
              key="card-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col lg:flex-row gap-10 items-start justify-center w-full"
            >
              {/* Card */}
              <div ref={cardRef}>
                <motion.div
                  initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <PokemonCard
                    card={generatedCard}
                    interactive
                    themeId={selectedTheme}
                    environmentId={selectedEnvironment}
                    scale={windowSize.width > 0 && windowSize.width < 420 ? (windowSize.width - 40) / 380 : 1}
                  />
                </motion.div>
              </div>

              {/* Info + Controls panel */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1 w-full min-w-0 max-w-md space-y-5"
              >
                {/* Trainer info */}
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Your Trainer Profile</h3>
                  <p className="font-display text-xl font-bold text-foreground">{generatedCard.trainerName}</p>
                  {generatedCard.aiData?.trainerTitle && (
                    <p className="text-sm mt-1" style={{ color: typeTheme.text }}>
                      {generatedCard.aiData.trainerTitle}
                    </p>
                  )}
                  {generatedCard.aiData?.career && (
                    <p className="text-xs text-foreground/50 mt-1">⚔️ {generatedCard.aiData.career} · {generatedCard.aiData.region}</p>
                  )}
                  {/* Scores row */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[
                      { label: 'Power', value: generatedCard.powerScore, icon: '⚡' },
                      { label: 'XP Level', value: generatedCard.xpLevel, icon: '📈' },
                      { label: 'Friendship', value: generatedCard.friendshipLevel, icon: '💖' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="text-center p-2 rounded-xl" style={{ background: typeTheme.bg }}>
                        <div className="text-lg">{icon}</div>
                        <div className="text-foreground font-bold text-sm">{value}</div>
                        <div className="text-foreground/40 text-[10px]">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="glass-card rounded-2xl p-5">
                  <button
                    id="toggle-theme-panel"
                    onClick={() => setShowThemePanel(!showThemePanel)}
                    className="w-full flex items-center justify-between text-xs text-foreground/40 uppercase tracking-wider mb-0 group"
                  >
                    <span className="flex items-center justify-center gap-1.5 w-full"><Palette className="w-3 h-3" /> Card Style</span>
                    <ChevronDown className={`w-4 h-4 transition-transform absolute right-5 ${showThemePanel ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showThemePanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <ThemeSelector
                            selectedTheme={selectedTheme}
                            onThemeChange={setSelectedTheme}
                            selectedEnvironment={selectedEnvironment}
                            onEnvironmentChange={setSelectedEnvironment}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Why this Pokémon */}
                {generatedCard.aiData?.pokemonReasoning && (
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Why {pokemon.displayName}?
                    </h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">{generatedCard.aiData.pokemonReasoning}</p>
                    {!generatedCard.favoriteWon && generatedCard.buddy && (
                      <p className="text-xs text-foreground/40 mt-2 italic">
                        * Your buddy {generatedCard.buddy.displayName} scored close — they&apos;re your loyal companion either way!
                      </p>
                    )}
                  </div>
                )}

                {/* Strengths */}
                {generatedCard.aiData?.strengths?.length ? (
                  <div className="glass-card rounded-2xl p-5">
                    <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Your Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedCard.aiData.strengths.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-3 py-1.5 rounded-full font-medium"
                          style={{ background: typeTheme.bg, color: typeTheme.text, border: `1px solid ${typeTheme.primary}40` }}
                        >
                          ✨ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Quick nav to new pages */}
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Explore More</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { href: '/booster', icon: '📦', label: 'Booster Pack' },
                      { href: '/battle', icon: '⚔️', label: 'Battle' },
                      { href: '/passport', icon: '🪪', label: 'Passport' },
                      { href: '/team', icon: '👥', label: 'Team Builder' },
                      { href: '/story', icon: '📖', label: 'My Story' },
                      { href: '/achievements', icon: '🏅', label: 'Achievements' },
                    ].map(({ href, icon, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-foreground/60 hover:text-foreground transition-all group"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <span className="text-base group-hover:scale-110 transition-transform">{icon}</span>
                        <span className="font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass border border-white/10 text-foreground hover:border-yellow-500 transition-all text-sm font-bold bg-yellow-500/10"
                    >
                      <Printer className="w-4 h-4" /> Print Card
                    </button>
                  </div>
                  <DownloadButton cardElementId="pokemon-card" card={generatedCard} />
                  <ShareButtons card={generatedCard} cardUrl={cardUrl} />
                  <button
                    onClick={handleRestart}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20 transition-all text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Take Quiz Again
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}



          {/* Personality Tab */}
          {revealed && activeTab === 'personality' && (
            <motion.div
              key="personality-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Radar */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-foreground/80 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: typeTheme.text }} />
                    Personality Radar
                  </h3>
                  <PersonalityRadar card={generatedCard} color={typeTheme.primary} />
                </div>

                {/* Full personality analysis */}
                <div className="space-y-4">
                  {generatedCard.aiData?.personalitySummary && (
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Full Analysis</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">{generatedCard.aiData.personalitySummary}</p>
                    </div>
                  )}
                  {generatedCard.aiData?.battleStyle && (
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-2">Battle Style</h3>
                      <span
                        className="text-sm px-3 py-1 rounded-full font-medium"
                        style={{ background: typeTheme.bg, color: typeTheme.text, border: `1px solid ${typeTheme.primary}40` }}
                      >
                        ⚔️ {generatedCard.aiData.battleStyle}
                      </span>
                    </div>
                  )}
                  {generatedCard.aiData?.growthAreas?.length ? (
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Growth Areas</h3>
                      <div className="space-y-2">
                        {generatedCard.aiData.growthAreas.map((g) => (
                          <div key={g} className="flex items-center gap-2 text-sm text-foreground/60">
                            <span>🌱</span> {g}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {generatedCard.aiData?.achievements?.length ? (
                    <div className="glass-card rounded-2xl p-5">
                      <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Achievements</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedCard.aiData.achievements.map((a) => (
                          <span
                            key={a}
                            className="text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{ background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}
                          >
                            🏅 {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* Story Tab */}
          {revealed && activeTab === 'story' && (
            <motion.div
              key="story-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto space-y-6"
            >
              {/* Main story */}
              {generatedCard.aiData?.story ? (
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: typeTheme.bg }}
                    >
                      📖
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">Your Origin Story</h2>
                      <p className="text-xs text-foreground/40">How you and {pokemon.displayName} met</p>
                    </div>
                  </div>
                  <p className="text-foreground/75 leading-loose text-base">
                    {generatedCard.aiData.story}
                  </p>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-8 text-center text-foreground/40">
                  <div className="text-4xl mb-4">📖</div>
                  <p>Generate your card with AI to unlock your origin story.</p>
                </div>
              )}

              {/* Trainer description */}
              {generatedCard.aiData?.trainerDescription && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Trainer Aura</h3>
                  <p className="text-foreground/70 leading-relaxed italic text-sm">
                    &quot;{generatedCard.aiData.trainerDescription}&quot;
                  </p>
                </div>
              )}

              {/* Flavor text */}
              {generatedCard.aiData?.cardFlavorText && (
                <div className="glass-card rounded-2xl p-6" style={{ border: `1px solid ${typeTheme.primary}30` }}>
                  <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">Card Flavor Text</h3>
                  <p className="text-foreground/60 leading-relaxed text-sm">
                    {generatedCard.aiData.cardFlavorText}
                  </p>
                </div>
              )}

              {/* Full story CTA */}
              <Link
                href="/story"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl glass-card text-foreground/70 hover:text-foreground transition-all text-sm font-medium border border-white/10 hover:border-white/20"
              >
                <Map className="w-4 h-4" />
                View Full Adventure Timeline
              </Link>
            </motion.div>
          )}

          {/* Team Tab */}
          {revealed && activeTab === 'team' && (
            <motion.div
              key="team-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl mx-auto space-y-6"
            >
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-2">Recommended Team</h2>
                <p className="text-sm text-foreground/50 mb-6">Pokémon chosen to complement your unique personality</p>

                {generatedCard.aiData?.recommendedTeam?.length ? (
                  <div className="space-y-3">
                    {/* Main Pokémon always first */}
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: typeTheme.bg, border: `1px solid ${typeTheme.primary}40` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pokemon.sprites.official_artwork ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                        alt={pokemon.displayName}
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-foreground">{pokemon.displayName}</p>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(255,215,0,0.2)', color: '#ffd700' }}
                          >
                            ⭐ Your Match
                          </span>
                        </div>
                        <p className="text-sm text-foreground/60 mt-1">{generatedCard.aiData.pokemonReasoning?.slice(0, 100)}…</p>
                      </div>
                    </div>

                    {/* Recommended team members */}
                    {generatedCard.aiData.recommendedTeam.map((member, i) => {
                      return (
                        <motion.div
                          key={member.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="flex items-center gap-4 p-4 rounded-xl glass hover:border-white/20 transition-all"
                          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.05)' }}
                          >
                            🔵
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{member.name}</p>
                            <p className="text-sm text-foreground/55 mt-0.5">{member.reason}</p>
                          </div>
                          <div
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ background: typeTheme.bg, color: typeTheme.text }}
                          >
                            #{i + 2}/6
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Placeholder slots */}
                    {Array.from({ length: Math.max(0, 5 - (generatedCard.aiData.recommendedTeam?.length ?? 0)) }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-white/10"
                        style={{ opacity: 0.4 }}
                      >
                        <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center text-foreground/20">?</div>
                        <p className="text-foreground/30 text-sm">Mystery slot…</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/40 text-center py-8">Generate your card with AI to unlock your recommended team.</p>
                )}
              </div>

              <Link
                href="/team"
                className="flex items-center justify-center gap-2 py-4 rounded-2xl glass-card text-foreground/70 hover:text-foreground transition-all text-sm font-medium border border-white/10 hover:border-white/20"
              >
                <Users className="w-4 h-4" />
                Full Team Builder with Type Coverage
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals for AR & Printing */}
        <AnimatePresence>
          {showARPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4"
            >
              <div className="w-full max-w-lg bg-[#111] p-6 rounded-3xl border border-white/10 relative">
                <button onClick={() => setShowARPreview(false)} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">✕</button>
                <h3 className="font-bold text-xl mb-4 text-foreground">AR Card Preview</h3>
                <ARCardPreview pokemonName={pokemon.displayName} />
                <p className="text-xs text-foreground/40 text-center mt-4">Point your camera at a flat surface and tap &quot;Enter AR&quot;.</p>
              </div>
            </motion.div>
          )}

          {showPrintModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4"
            >
              <div className="w-full max-w-md bg-[#111] p-6 rounded-3xl border border-white/10 relative text-center">
                <button onClick={() => setShowPrintModal(false)} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">✕</button>
                <h3 className="font-display font-bold text-2xl mb-2 text-foreground">Print Physical Card</h3>
                <p className="text-foreground/60 mb-6 text-sm">Get a real, holographic printed version of your unique Pokémon personality card delivered to your door.</p>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-6 text-left">
                  <p className="text-yellow-400 font-bold mb-1">Premium Feature</p>
                  <p className="text-foreground/50 text-xs">This feature connects to Printful/Prodigi API. Mock checkout flow activated.</p>
                </div>

                <button 
                  onClick={() => {
                    alert("Connecting to Print-on-Demand Provider checkout...");
                    setShowPrintModal(false);
                  }}
                  className="w-full py-4 bg-foreground text-background font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Checkout ($9.99)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
