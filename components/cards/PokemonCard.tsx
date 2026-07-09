'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { TYPE_COLORS } from '@/types/pokemon';
import type { GeneratedCard } from '@/types/card';
import { RARITY_CONFIGS } from '@/types/quiz';
import { StatBar } from './StatBar';
import { TypeBadge } from './TypeBadge';
import { RarityBadge } from './RarityBadge';
import { formatDexNumber } from '@/lib/pokemon';
import { getTrainerRank } from '@/types/card';
import { CARD_THEMES, type CardThemeId } from './themes';
import { ENVIRONMENT_BACKGROUNDS, getEnvironmentForType, type EnvironmentTheme } from './themes/backgrounds';
import { ExFullArtLayout } from './layouts/ExFullArtLayout';

interface PokemonCardProps {
  card: GeneratedCard;
  interactive?: boolean;
  scale?: number;
  themeId?: CardThemeId;
  environmentId?: EnvironmentTheme | null;
}

// SVG pattern definitions
const SVG_PATTERNS: Record<string, string> = {
  dots: `<pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.15"/></pattern>`,
  lines: `<pattern id="lines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="20" x2="20" y2="0" stroke="currentColor" stroke-width="0.5" opacity="0.15"/></pattern>`,
  diamonds: `<pattern id="diamonds" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2"/></pattern>`,
  'hex-grid': `<pattern id="hex" x="0" y="0" width="28" height="32" patternUnits="userSpaceOnUse"><polygon points="14,2 26,9 26,23 14,30 2,23 2,9" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.12"/></pattern>`,
  stars: `<pattern id="stars" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><text x="5" y="14" font-size="6" opacity="0.2" fill="currentColor">★</text><text x="18" y="28" font-size="4" opacity="0.15" fill="currentColor">✦</text></pattern>`,
  circuit: `<pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><rect x="0" y="19" width="40" height="2" fill="currentColor" opacity="0.08"/><rect x="19" y="0" width="2" height="40" fill="currentColor" opacity="0.08"/><circle cx="20" cy="20" r="3" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2"/></pattern>`,
  energy: `<pattern id="energy" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 L10,0 L20,10 L10,20 Z" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.12"/></pattern>`,
  'japanese-lines': `<pattern id="jp" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="16" y2="16" stroke="currentColor" stroke-width="0.5" opacity="0.1"/><line x1="16" y1="0" x2="0" y2="16" stroke="currentColor" stroke-width="0.5" opacity="0.05"/></pattern>`,
  'pixel-grid': `<pattern id="px" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="8" height="8" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.15"/></pattern>`,
  scanlines: `<pattern id="scan" x="0" y="0" width="100%" height="4" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="100%" height="2" fill="black" opacity="0.25"/></pattern>`,
  none: '',
};

const PATTERN_REF: Record<string, string> = {
  dots: 'dots', lines: 'lines', diamonds: 'diamonds', 'hex-grid': 'hex',
  stars: 'stars', circuit: 'circuit', energy: 'energy',
  'japanese-lines': 'jp', 'pixel-grid': 'px', scanlines: 'scan', none: '',
};

// Energy bar for GX/V/VMAX style
function EnergyBar({ color }: { color: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 flex gap-0.5 px-3 pb-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-full opacity-60"
          style={{ background: color, animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function PokemonCard({
  card,
  interactive = true,
  scale = 1,
  themeId = 'classic-tcg',
  environmentId = null,
}: PokemonCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(interactive ?? false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [motionPictureUrl, setMotionPictureUrl] = useState<string | null>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 });

  const pokemon = card.matchedPokemon;
  const primaryType = pokemon.primaryType;
  const typeTheme = TYPE_COLORS[primaryType];
  const rarityConfig = RARITY_CONFIGS[card.rarity];
  const trainerRank = getTrainerRank(card.xpLevel);
  const theme = CARD_THEMES[themeId];
  const envId = environmentId ?? getEnvironmentForType(primaryType);
  const environment = ENVIRONMENT_BACKGROUNDS[envId];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [interactive, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return;
    mouseX.set(0);
    mouseY.set(0);
    setGlarePos({ x: 50, y: 50 });
  }, [interactive, mouseX, mouseY]);

  // Pre-fetch the motion picture (GIF) for the cinematic attack
  useEffect(() => {
    if (!interactive) return;
    const moveName = card.signatureMove?.name || (card.aiData?.battleStyle ? `${card.aiData.battleStyle.split(' ')[0]}` : 'attack');
    const query = `${pokemon.displayName} ${pokemon.types[0]} gifs`.toLowerCase();

    fetch(`/api/gif?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data.url) setMotionPictureUrl(data.url);
      })
      .catch(console.error);
  }, [interactive, pokemon.displayName, card.signatureMove?.name, card.aiData?.battleStyle]);

  const artworkUrl = pokemon.sprites.official_artwork
    ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const buddyArtUrl = card.buddy
    ? (card.buddy.sprites.official_artwork ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.buddy.id}.png`)
    : null;

  // Build background based on theme + environment
  const isFullArt = theme.overlayStyle === 'full-art';
  const isRetro = themeId === 'retro-gameboy';
  const isPixel = themeId === 'pixel-art';
  const isRainbow = themeId === 'rainbow-rare';
  const isGold = themeId === 'gold-secret';

  const cardBackground = isRainbow
    ? 'linear-gradient(135deg, #ff006080 0%, #ff8c0060 15%, #ffd70060 30%, #00ff8060 45%, #00cfff60 60%, #8000ff60 75%, #ff006060 100%), radial-gradient(ellipse at center, #0a0b0f 0%, #0a0b0f 100%)'
    : isGold
      ? `linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(255,215,0,0.1) 50%, rgba(184,134,11,0.15) 100%), ${environment.gradient}`
      : isRetro
        ? 'linear-gradient(180deg, #8bac0f 0%, #9bbc0f 50%, #8bac0f 100%)'
        : environment.gradient;

  const borderColor = isRainbow
    ? 'transparent'
    : isGold
      ? '#d4af37'
      : isRetro
        ? '#306230'
        : rarityConfig.borderColor;

  const boxShadow = isRetro
    ? `0 8px 24px rgba(0,0,0,0.8), 0 0 0 4px #306230`
    : isRainbow
      ? `0 0 30px rgba(255,0,128,0.5), 0 0 60px rgba(0,207,255,0.3), 0 25px 60px rgba(0,0,0,0.8)`
      : `0 25px 60px rgba(0,0,0,0.8), 0 0 0 1px ${rarityConfig.borderColor}30, 0 0 40px ${rarityConfig.glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`;

  const fontFamily = theme.fontStyle === 'pixel'
    ? `"Press Start 2P", "Courier New", monospace`
    : theme.fontStyle === 'mono'
      ? `"JetBrains Mono", "Fira Code", monospace`
      : `inherit`;

  // SVG pattern for background
  const patternKey = PATTERN_REF[theme.backgroundPattern] || '';
  const patternDef = SVG_PATTERNS[theme.backgroundPattern] || '';

  const statColors = isRetro
    ? { primary: '#306230', secondary: '#8bac0f' }
    : isGold
      ? { primary: '#d4af37', secondary: '#ffd700' }
      : { primary: typeTheme.primary, secondary: typeTheme.secondary };

  return (
    <motion.div
      ref={cardRef}
      id="pokemon-card"
      className={`card-wrapper relative ${theme.wrapperClass}`}
      style={{
        width: `${theme.widthRatio * scale}px`,
        height: `${theme.heightRatio * scale}px`,
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        fontFamily,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', cursor: interactive ? 'pointer' : 'default' }}
        onClick={() => {
          if (interactive && !isZoomed) setIsFlipped(!isFlipped);
        }}
        onDoubleClick={(e) => {
          if (interactive && !isFlipped) {
            e.stopPropagation();
            setIsZoomed(true);
          }
        }}
      >
        {/* Card back (Back Face) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: theme.borderRadius,
            overflow: 'hidden',
            boxShadow,
            border: `${theme.borderWidth} solid ${borderColor}60`,
          }}
        >
          <img src="/img/pokeback.png" alt="Card Back" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        </div>

        {/* Card Front (Front Face) */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* ── Card face ─────────────────────────────────────────── */}
          {isFullArt ? (
            <ExFullArtLayout
              card={card}
              theme={theme}
              typeTheme={typeTheme}
              environment={environment}
              artworkUrl={artworkUrl}
              buddyArtUrl={buddyArtUrl}
              glarePos={glarePos}
              interactive={interactive}
              scale={scale}
            />
          ) : (
            <div
              className="absolute inset-0 overflow-hidden select-none"
              style={{
                borderRadius: theme.borderRadius,
                background: cardBackground,
                border: `${theme.borderWidth} solid ${borderColor}60`,
                boxShadow,
              }}
            >
              {/* SVG background pattern */}
              {patternDef && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ color: isGold ? '#d4af37' : typeTheme.primary }}
                >
                  <defs dangerouslySetInnerHTML={{ __html: patternDef }} />
                  <rect width="100%" height="100%" fill={`url(#${patternKey})`} />
                </svg>
              )}

              {/* Rainbow animated border */}
              {isRainbow && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: theme.borderRadius,
                    background: 'linear-gradient(135deg, #ff0080, #ff8c00, #ffd700, #00ff80, #00cfff, #8000ff, #ff0080)',
                    backgroundSize: '400% 400%',
                    animation: 'holographic 3s linear infinite',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                  }}
                />
              )}

              {/* Holographic overlay */}
              {theme.holoIntensity > 0 && (
                <div
                  className="holographic-overlay"
                  style={{ opacity: theme.holoIntensity > 0.5 ? undefined : theme.holoIntensity }}
                />
              )}

              {/* Glare effect */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay"
                style={{
                  borderRadius: theme.borderRadius,
                  background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
                }}
              />

              {/* Scanline overlay for retro/pixel */}
              {(isRetro || isPixel) && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 4px)',
                    borderRadius: theme.borderRadius,
                  }}
                />
              )}

              {/* Card shine */}
              {!isRetro && !isPixel && <div className="card-shine" />}

              {/* ── Card content ────────────────────────────────────── */}
              <div
                className="relative z-10 h-full flex flex-col p-4"
                style={{ fontSize: `${scale}rem`, color: isRetro ? '#0f380f' : 'inherit' }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className={`text-[10px] leading-none font-mono ${isRetro ? 'text-[#0f380f]/70' : 'text-foreground/40'}`}>
                      {card.cardNumber}
                    </p>
                    <p className={`text-xs font-bold mt-0.5 leading-tight ${isRetro ? 'text-[#0f380f]' : 'text-foreground/80'}`}>
                      {card.trainerName}
                    </p>
                    {card.aiData?.trainerTitle && (
                      <p
                        className="text-[10px] leading-tight mt-0.5"
                        style={{ color: isRetro ? '#0f380f' : isGold ? '#d4af37' : typeTheme.text }}
                      >
                        {card.aiData.trainerTitle}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <RarityBadge rarity={card.rarity} small />
                    <p className={`text-[10px] mt-1 font-mono ${isRetro ? 'text-[#0f380f]/60' : 'text-foreground/40'}`}>
                      {formatDexNumber(pokemon.id)}
                    </p>
                  </div>
                </div>

                {/* Pokémon name + types */}
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className="font-display font-bold leading-none"
                    style={{
                      fontSize: isPixel ? '0.7rem' : isVMAX(themeId) ? '1.4rem' : '1.2rem',
                      color: isRetro ? '#0f380f' : isGold ? '#d4af37' : typeTheme.text,
                      textShadow: theme.textGlow && !isRetro
                        ? `0 0 20px ${typeTheme.glow}, 0 0 40px ${typeTheme.glow}`
                        : 'none',
                    }}
                  >
                    {pokemon.displayName}
                    {isGX(themeId) && <span className="text-[0.6em] ml-1 opacity-80">-GX</span>}
                    {themeId === 'vmax' && <span className="text-[0.5em] ml-1 opacity-80">VMAX</span>}
                    {themeId === 'vstar' && <span className="text-[0.5em] ml-1 opacity-80">VSTAR</span>}
                    {themeId === 'v' && <span className="text-[0.5em] ml-1 opacity-80">V</span>}
                  </h2>
                  <div className="flex gap-1">
                    {pokemon.types.map((t) => (
                      <TypeBadge key={t} type={t} small />
                    ))}
                  </div>
                </div>

                {/* Artwork area */}
                <div
                  className="relative rounded-2xl overflow-hidden mb-3 flex-shrink-0"
                  style={{
                    height: isFullArt ? '220px' : '160px',
                    background: isFullArt
                      ? environment.gradient
                      : `radial-gradient(ellipse at center, ${typeTheme.bg} 0%, transparent 70%)`,
                    border: isRetro
                      ? '2px solid #0f380f50'
                      : `1px solid ${typeTheme.primary}25`,
                    borderRadius: isPixel || isRetro ? '4px' : undefined,
                  }}
                >
                  {/* Full art background overlay */}
                  {isFullArt && (
                    <div className="absolute inset-0" style={{ background: environment.gradient }} />
                  )}

                  {/* Buddy badge */}
                  {card.buddy && buddyArtUrl && (
                    <div className="absolute top-2 left-2 z-10">
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ background: `${typeTheme.bg}`, border: `1px solid ${typeTheme.primary}40` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/_next/image?url=${encodeURIComponent(buddyArtUrl)}&w=128&q=75`} alt={card.buddy.displayName} className="w-10 h-10 object-contain" />
                      </div>
                      <p className="text-[8px] text-foreground/50 text-center mt-0.5">Buddy</p>
                    </div>
                  )}

                  {/* Main artwork */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/_next/image?url=${encodeURIComponent(artworkUrl)}&w=1080&q=75`}
                    alt={pokemon.displayName}
                    className="absolute inset-0 w-full h-full object-contain p-2 drop-shadow-2xl"
                    style={{
                      filter: `${theme.artworkFilter} drop-shadow(0 4px 20px ${typeTheme.glow})`,
                      imageRendering: isPixel || isRetro ? 'pixelated' : 'auto',
                      transform: `scale(${theme.artworkScale})`,
                    }}
                  />

                  {/* XP level badge */}
                  <div
                    className="absolute top-2 right-2 flex flex-col items-center justify-center w-10 h-10"
                    style={{
                      borderRadius: theme.badgeShape === 'square' ? '6px' : theme.badgeShape === 'diamond' ? '0' : '50%',
                      background: isRetro ? '#0f380f' : rarityConfig.gradient,
                      border: isRetro ? '2px solid #0f380f' : `1.5px solid ${rarityConfig.borderColor}`,
                      boxShadow: isRetro ? 'none' : `0 0 10px ${rarityConfig.glowColor}`,
                      transform: theme.badgeShape === 'diamond' ? 'rotate(45deg)' : 'none',
                    }}
                  >
                    <div style={{ transform: theme.badgeShape === 'diamond' ? 'rotate(-45deg)' : 'none' }}>
                      <p className={`text-[7px] leading-none ${isRetro ? 'text-[#9bbc0f]' : 'text-foreground/80'}`}>LV</p>
                      <p className={`text-[11px] font-bold leading-none ${isRetro ? 'text-[#9bbc0f]' : 'text-foreground'}`}>{card.xpLevel}</p>
                    </div>
                  </div>

                  {/* Energy bar */}
                  {theme.showEnergyBar && (
                    <EnergyBar color={typeTheme.primary} />
                  )}
                </div>

                {/* Stats section */}
                {theme.statBarStyle !== 'hidden' && (
                  <div className="space-y-1 mb-3">
                    {pokemon.stats.map((stat) => (
                      <StatBar
                        key={stat.name}
                        stat={stat}
                        typeTheme={{ ...typeTheme, primary: statColors.primary, secondary: statColors.secondary }}
                        compact
                        segmented={theme.statBarStyle === 'segmented'}
                        dots={theme.statBarStyle === 'dots'}
                      />
                    ))}
                  </div>
                )}

                {/* Info row */}
                <div
                  className="rounded-xl p-2.5 mb-2 grid grid-cols-3 gap-1 text-center"
                  style={{
                    background: isRetro ? 'rgba(15,56,15,0.2)' : 'rgba(0,0,0,0.3)',
                    border: isRetro ? '1px solid #0f380f30' : `1px solid ${typeTheme.primary}20`,
                    borderRadius: isPixel || isRetro ? '4px' : undefined,
                  }}
                >
                  {[
                    { label: 'Height', value: `${(pokemon.height / 10).toFixed(1)}m` },
                    { label: 'Weight', value: `${(pokemon.weight / 10).toFixed(1)}kg` },
                    { label: 'Friendship', value: card.friendshipLevel },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className={`text-[9px] leading-none ${isRetro ? 'text-[#0f380f]/60' : 'text-foreground/40'}`}>{label}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${isRetro ? 'text-[#0f380f]' : 'text-foreground/80'}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Personality summary */}
                {card.aiData?.personalitySummary && (
                  <div
                    className="rounded-xl p-2.5 mb-2 flex-1 overflow-hidden"
                    style={{
                      background: isRetro ? 'rgba(15,56,15,0.15)' : 'rgba(0,0,0,0.25)',
                      border: isRetro ? '1px solid #0f380f25' : `1px solid ${typeTheme.primary}15`,
                      borderRadius: isPixel || isRetro ? '4px' : undefined,
                    }}
                  >
                    <p className={`text-[9px] mb-1 uppercase tracking-wider ${isRetro ? 'text-[#0f380f]/50' : 'text-foreground/40'}`}>Personality</p>
                    <p className={`text-[9px] leading-relaxed line-clamp-4 ${isRetro ? 'text-[#0f380f]/80' : 'text-foreground/70'}`}>
                      {card.aiData.personalitySummary}
                    </p>
                  </div>
                )}

                {/* Signature Move */}
                {card.signatureMove && (
                  <div
                    className="rounded-xl px-3 py-2 mb-2"
                    style={{
                      background: isRetro ? 'rgba(15,56,15,0.3)' : `${typeTheme.bg}`,
                      border: isRetro ? '1px solid #0f380f40' : `1px solid ${typeTheme.primary}30`,
                      borderRadius: isPixel || isRetro ? '4px' : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] uppercase tracking-wider ${isRetro ? 'text-[#0f380f]/50' : 'text-foreground/50'}`}>
                        Signature Move
                      </span>
                      <TypeBadge type={card.signatureMove.type as Parameters<typeof TypeBadge>[0]['type']} tiny />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[11px] font-bold ${isRetro ? 'text-[#0f380f]' : 'text-foreground'}`}>
                        {card.signatureMove.name}
                      </p>
                      <div className={`flex gap-2 text-[9px] ${isRetro ? 'text-[#0f380f]/60' : 'text-foreground/50'}`}>
                        {card.signatureMove.power && <span>PWR {card.signatureMove.power}</span>}
                        {card.signatureMove.accuracy && <span>ACC {card.signatureMove.accuracy}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className={`flex items-center justify-between mt-auto pt-1.5 border-t ${isRetro ? 'border-[#0f380f]/20' : 'border-white/5'}`}>
                  <p className={`text-[8px] ${isRetro ? 'text-[#0f380f]/50' : 'text-foreground/30'}`}>{trainerRank}</p>
                  <p className={`text-[8px] font-mono ${isRetro ? 'text-[#0f380f]/50' : 'text-foreground/30'}`}>#{card.id.slice(0, 8)}</p>
                  <p className={`text-[8px] ${isRetro ? 'text-[#0f380f]/50' : 'text-foreground/30'}`}>
                    {new Date(card.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cinematic Zoomed Attack Overlay */}
          <AnimatePresence>
            {isZoomed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ type: 'spring', damping: 15 }}
                className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden"
                style={{ borderRadius: theme.borderRadius }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                }}
              >
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#000_100%)] z-10 pointer-events-none" />

                {/* Burst background */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-[-50%] opacity-40"
                  style={{ background: `repeating-conic-gradient(from 0deg, transparent 0deg, ${typeTheme.primary} 10deg, transparent 20deg)` }}
                />

                {motionPictureUrl ? (
                  <motion.img
                    src={motionPictureUrl}
                    alt="Attack Animation"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-20 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  />
                ) : (
                  <motion.img
                    src={artworkUrl}
                    alt="Zoomed Pokemon"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-20 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                  />
                )}

                <motion.div
                  initial={{ x: '-100%', skewX: -20 }}
                  animate={{ x: 0, skewX: -10 }}
                  className="absolute z-30 bottom-[20%] w-[120%] bg-red-600/90 py-3 border-y-4 border-white shadow-[0_0_30px_red] flex items-center justify-center backdrop-blur-sm"
                >
                  <h2 className="text-white font-black italic uppercase tracking-tighter" style={{ fontSize: `${(scale || 1) * 2.2}rem`, textShadow: '3px 3px 0 black' }}>
                    {card.signatureMove?.name || (card.aiData?.battleStyle ? `${card.aiData.battleStyle.split(' ')[0]} Strike` : 'Hyper Beam')}
                  </h2>
                </motion.div>

                <p className="absolute bottom-4 z-30 text-white/50 text-xs font-bold tracking-widest uppercase">Tap to close</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper predicates
function isGX(themeId: CardThemeId) { return themeId === 'gx'; }
function isVMAX(themeId: CardThemeId) { return themeId === 'vmax' || themeId === 'vstar'; }
