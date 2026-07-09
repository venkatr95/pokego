import React from 'react';
import type { GeneratedCard } from '@/types/card';
import { TYPE_COLORS, type PokemonTypeName } from '@/types/pokemon';
import type { CardTheme } from '../themes';
import type { EnvironmentTheme } from '../themes/backgrounds';
import { ENVIRONMENT_BACKGROUNDS } from '../themes/backgrounds';

interface ExFullArtLayoutProps {
  card: GeneratedCard;
  theme: CardTheme;
  typeTheme: typeof TYPE_COLORS[PokemonTypeName];
  environment: typeof ENVIRONMENT_BACKGROUNDS[EnvironmentTheme];
  artworkUrl: string;
  buddyArtUrl: string | null;
  glarePos: { x: number; y: number };
  interactive: boolean;
  scale: number;
}

const TYPE_ICONS: Record<PokemonTypeName, string> = {
  normal: '⚪', fire: '🔥', water: '💧', electric: '⚡', grass: '🌿',
  ice: '❄️', fighting: '👊', poison: '☠️', ground: '🌍', flying: '🦅',
  psychic: '🔮', bug: '🐛', rock: '🪨', ghost: '👻', dragon: '🐉',
  dark: '🌑', steel: '⚙️', fairy: '✨',
};

export function ExFullArtLayout({
  card,
  theme,
  typeTheme,
  environment,
  artworkUrl,
  buddyArtUrl,
  glarePos,
  scale,
}: ExFullArtLayoutProps) {
  const pokemon = card.matchedPokemon;
  const hp = pokemon.stats.find(s => s.name === 'hp')?.base_stat || 120;
  // Scale HP a bit to look more like modern EX cards (which often have 200-330 HP)
  const displayHp = Math.max(hp * 2, 200);

  const stageLabel = pokemon.evolutionStage === 1 ? 'BASIC' : `STAGE ${pokemon.evolutionStage - 1}`;
  const energyIcon = TYPE_ICONS[pokemon.primaryType] || '⚪';

  // Fallbacks for attacks to ensure they are never blank
  const attack1Name = card.aiData?.battleStyle ? `${card.aiData.battleStyle.split(' ')[0]} Strike` : 'Swift Strike';
  const attack1Damage = Math.floor(displayHp * 0.3) + '+';
  const attack1Desc = card.aiData?.battleStyle 
    ? `If this Pokémon has any damage counters on it, this attack does ${Math.floor(displayHp * 0.2)} more damage.` 
    : 'This attack does 30 more damage for each Energy attached.';

  const attack2Name = card.signatureMove?.name || 'Hyper Blast';
  const attack2Damage = card.signatureMove?.power || Math.floor(displayHp * 0.8);
  const attack2Desc = card.signatureMove?.description || 'Discard 3 Energy from this Pokémon.';

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none flex flex-col"
      style={{
        borderRadius: theme.borderRadius,
        background: environment.gradient,
        border: `${theme.borderWidth} solid #c0c0c0`, // Silver edge
        boxShadow: `0 25px 60px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 0 20px rgba(255,255,255,0.2)`,
        fontSize: `${scale}rem`,
      }}
    >
      {/* 1. Full Art Background Image */}
      <img
        src={artworkUrl}
        alt={pokemon.displayName}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: `${theme.artworkFilter} contrast(1.1) saturate(1.2)`,
          transform: `scale(${theme.artworkScale || 1.1})`,
          objectPosition: 'center 20%',
        }}
      />

      {/* Holographic overlay */}
      {theme.holoIntensity > 0 && (
        <div
          className="holographic-overlay"
          style={{ opacity: theme.holoIntensity > 0.5 ? undefined : theme.holoIntensity }}
        />
      )}

      {/* Glare effect */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay z-50"
        style={{
          borderRadius: theme.borderRadius,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
        }}
      />

      {/* Inner shadow/vignette for depth */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] z-10" />

      {/* --- CONTENT OVERLAYS --- */}
      <div className="relative z-20 h-full flex flex-col pt-3 pb-2 px-3 text-white drop-shadow-md">
        
        {/* HEADER ROW */}
        <div className="flex items-start justify-between">
          {/* Left: Stage + Name */}
          <div className="flex items-start gap-1">
            {/* Evolution Portrait & Stage Badge */}
            <div className="relative -ml-1 mt-1">
              {/* Circular Portrait */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-gray-100 to-gray-300 border-[2px] border-white shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_-4px_4px_rgba(0,0,0,0.2)] z-10 relative flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-gray-400 flex items-center justify-center">
                  {buddyArtUrl ? <img src={buddyArtUrl} crossOrigin="anonymous" className="w-9 h-9 object-contain drop-shadow-md" alt="Pre-evo" /> : <span className="text-xl drop-shadow-md">{energyIcon}</span>}
                </div>
              </div>
              {/* STAGE label banner attached to portrait */}
              <div className="absolute top-0 left-6 bg-gradient-to-b from-white via-gray-200 to-gray-400 text-black px-3 py-0.5 text-[7px] font-black italic tracking-widest border-y border-r border-gray-400 shadow-sm z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)', minWidth: '60px' }}>
                <span className="pl-4">{stageLabel}</span>
              </div>
            </div>
            
            {/* Pokemon Name */}
            <div className="flex flex-col ml-1 mt-0">
              <h1 className="font-display font-black italic tracking-tighter text-3xl flex items-end drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ color: 'white', textShadow: '2px 2px 0px #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 4px 6px rgba(0,0,0,0.8)' }}>
                {pokemon.displayName} 
                <span className="text-2xl ml-1 text-transparent bg-clip-text bg-gradient-to-tr from-cyan-300 to-green-300" style={{ WebkitTextStroke: '1px black', filter: 'drop-shadow(2px 2px 0 black)', textShadow: 'none' }}>ex</span>
              </h1>
              {pokemon.evolutionStage > 1 && (
                <span className="text-[7px] font-bold italic text-black -mt-1 ml-0.5" style={{ textShadow: '1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff' }}>
                  Evolves from Basic Pokémon
                </span>
              )}
            </div>
          </div>

          {/* Right: HP + Energy */}
          <div className="flex flex-col items-end pt-1">
            <div className="flex items-end gap-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              <span className="text-[12px] font-black text-black mb-1.5 ml-1" style={{ textShadow: '1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 0 1px 0 #fff' }}>HP</span>
              <span className="text-4xl font-black italic leading-none text-black" style={{ textShadow: '1.5px 1.5px 0 #fff, -1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 0px 3px 6px rgba(0,0,0,0.5)' }}>{displayHp}</span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br from-red-400 to-red-600 border-[2px] border-black shadow-[0_2px_4px_rgba(0,0,0,0.6)] ml-1">
                <span className="drop-shadow-sm">{energyIcon}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* ATTACKS SECTION */}
        <div className="flex flex-col gap-3 mb-2 relative">
          
          {/* Attack 1 */}
          <div className="mb-1">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center text-[10px] border border-black/50 shadow-sm">
                  {energyIcon}
                </div>
                <h2 className="font-bold text-xl leading-none font-display tracking-wide" style={{ color: 'white', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 6px rgba(0,0,0,0.8)' }}>
                  {attack1Name}
                </h2>
              </div>
              <span className="font-black text-xl" style={{ color: 'white', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                {attack1Damage}
              </span>
            </div>
            <p className="text-[10px] leading-tight text-white font-medium pl-7" style={{ textShadow: '1px 1px 2px black, 0 0 4px black' }}>
              {attack1Desc}
            </p>
          </div>

          {/* Attack 2 */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5 mr-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-white to-gray-300 flex items-center justify-center text-[10px] border border-black/50 shadow-sm">
                      {i <= 3 ? energyIcon : '⚪'}
                    </div>
                  ))}
                </div>
                <h2 className="font-bold text-2xl leading-none font-display tracking-wide" style={{ color: 'white', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 6px rgba(0,0,0,0.8)' }}>
                  {attack2Name}
                </h2>
              </div>
              <span className="font-black text-2xl" style={{ color: 'white', textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                {attack2Damage}
              </span>
            </div>
            <p className="text-[11px] leading-tight text-white font-medium mt-1" style={{ textShadow: '1px 1px 2px black, 0 0 4px black' }}>
              {attack2Desc}
            </p>
          </div>
        </div>

        {/* BOTTOM BANNER (Weakness/Resistance/Retreat) */}
        <div className="flex items-center justify-between px-5 py-1 mb-2 bg-gradient-to-r from-transparent via-black/80 to-transparent border-y border-white/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[8px] font-bold tracking-widest uppercase text-white">
            <span style={{ textShadow: '1px 1px 2px black' }}>weakness</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] drop-shadow-md">{TYPE_ICONS[pokemon.weaknesses?.[0]] || '💧'}</span>
              <span style={{ textShadow: '1px 1px 2px black' }}>×2</span>
            </div>
          </div>
          <div className="w-px h-3 bg-white/30" />
          <div className="flex items-center gap-2 text-[8px] font-bold tracking-widest uppercase text-white">
            <span style={{ textShadow: '1px 1px 2px black' }}>resistance</span>
          </div>
          <div className="w-px h-3 bg-white/30" />
          <div className="flex items-center gap-2 text-[8px] font-bold tracking-widest uppercase text-white">
            <span style={{ textShadow: '1px 1px 2px black' }}>retreat</span>
            <div className="flex gap-0.5 drop-shadow-md">
              <span className="text-[10px]">⚪</span>
              <span className="text-[10px]">⚪</span>
            </div>
          </div>
        </div>

        {/* EX RULE BOX */}
        <div className="flex items-end justify-between px-2">
          <div className="flex flex-col text-[7px] text-white font-medium" style={{ textShadow: '1px 1px 2px black' }}>
            <span className="font-bold mb-0.5">illus. AI</span>
            <span className="bg-white/90 text-black px-1 py-0.5 rounded font-mono inline-block text-center mb-0.5 w-max shadow-sm" style={{ textShadow: 'none' }}>G MEW EN 199/165 ★</span>
            <span>©2024 Pokémon / Nintendo / Creatures / GAME FREAK</span>
          </div>
          
          <div className="flex-1 max-w-[200px] bg-gradient-to-r from-gray-200 via-white to-gray-300 border-[1.5px] border-gray-400 rounded-full px-3 py-1 shadow-[0_2px_4px_rgba(0,0,0,0.6)] ml-2" style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}>
            <div className="flex items-center justify-between">
              <span className="font-black text-[10px] italic text-black pr-2">Pokémon <span className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-green-400" style={{ WebkitTextStroke: '0.5px black', filter: 'drop-shadow(1px 1px 0 black)' }}>ex</span> rule</span>
              <span className="text-[7px] text-black font-bold text-right leading-tight border-l border-gray-400 pl-2">When your Pokémon <span className="italic">ex</span> is Knocked Out, your opponent takes 2 Prize cards.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
