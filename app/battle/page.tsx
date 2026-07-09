'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { TYPE_COLORS } from '@/types/pokemon';
import { Swords, Zap, Trophy, RotateCcw, Sparkles, Link as LinkIcon, Check } from 'lucide-react';

// Hardcoded AI opponent trainers
const OPPONENTS = [
  {
    name: 'Trainer Red',
    pokemon: { displayName: 'Charizard', type: 'fire', id: 6, power: 8500, rarity: 'Legendary', xp: 98 },
    avatar: '🔴',
    title: 'Champion of Pallet',
    style: 'Aggressive',
    color: '#F08030',
  },
  {
    name: 'Trainer Misty',
    pokemon: { displayName: 'Starmie', type: 'water', id: 121, power: 4800, rarity: 'Rare', xp: 65 },
    avatar: '🩵',
    title: 'Cerulean City Gym Leader',
    style: 'Balanced',
    color: '#6890F0',
  },
  {
    name: 'Trainer Cynthia',
    pokemon: { displayName: 'Garchomp', type: 'dragon', id: 445, power: 9200, rarity: 'Mythic', xp: 96 },
    avatar: '👑',
    title: 'Sinnoh Champion',
    style: 'Tactical',
    color: '#7038F8',
  },
  {
    name: 'Trainer Gary',
    pokemon: { displayName: 'Blastoise', type: 'water', id: 9, power: 5200, rarity: 'Rare', xp: 72 },
    avatar: '⭐',
    title: 'Pokémon Researcher',
    style: 'Strategic',
    color: '#6890F0',
  },
  {
    name: 'Trainer Ash',
    pokemon: { displayName: 'Pikachu', type: 'electric', id: 25, power: 6800, rarity: 'Epic', xp: 85 },
    avatar: '⚡',
    title: 'World Coronation Champion',
    style: 'Adaptive',
    color: '#F8D030',
  },
];

type BattlePhase = 'select' | 'preview' | 'battling' | 'result';

interface BattleResult {
  playerWon: boolean;
  winProbability: number;
  summary: string;
  mvpMove: string;
  playerHP: number;
  opponentHP: number;
}

function computeBattle(
  playerPower: number,
  playerRarity: string,
  opponentPower: number,
  opponentRarity: string,
): BattleResult {
  const RARITY_BONUS: Record<string, number> = {
    'Common': 0, 'Uncommon': 100, 'Rare': 250, 'Epic': 500,
    'Legendary': 800, 'Mythic': 1000, 'Shiny': 1200, 'Secret Rare': 1500,
  };
  const playerTotal = playerPower + (RARITY_BONUS[playerRarity] ?? 0);
  const opponentTotal = opponentPower + (RARITY_BONUS[opponentRarity] ?? 0);
  const sum = playerTotal + opponentTotal;
  const winProb = Math.round((playerTotal / sum) * 100);

  const playerWon = Math.random() * 100 < winProb;
  const playerHP = playerWon
    ? Math.round(50 + Math.random() * 50)
    : Math.round(5 + Math.random() * 25);
  const opponentHP = playerWon
    ? Math.round(5 + Math.random() * 15)
    : Math.round(40 + Math.random() * 60);

  const MOVES = ['Hyper Beam', 'Sacred Fire', 'Aura Sphere', 'Dragon Rush', 'Future Sight', 'Close Combat'];
  const mvpMove = MOVES[Math.floor(Math.random() * MOVES.length)];

  const summary = playerWon
    ? `${playerRarity} energy overwhelmed the opponent! Victory secured with ${mvpMove}!`
    : `A tough battle — the opponent's ${opponentRarity} power proved too great this time.`;

  return { playerWon, winProbability: winProb, summary, mvpMove, playerHP, opponentHP };
}

function HPBar({ current, max = 100 }: { current: number; max?: number; color: string }) {
  const pct = Math.max(0, (current / max) * 100);
  const hue = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div className="flex justify-between text-xs text-foreground/50 mb-1">
        <span>HP</span>
        <span>{current}/{max}</span>
      </div>
      <div className="h-3 bg-foreground/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: hue }}
          initial={{ width: '100%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function BattlePage() {
  const router = useRouter();
  const { generatedCard } = useQuizStore();
  const [phase, setPhase] = useState<BattlePhase>('select');
  const [selectedOpponent, setSelectedOpponent] = useState<(typeof OPPONENTS)[0] | null>(null);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [logIdx, setLogIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyChallengeLink = () => {
    const link = `${window.location.origin}/battle/challenge/${generatedCard?.id || 'mock'}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!generatedCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-6xl mb-4">⚔️</div>
        <h1 className="font-display text-2xl font-bold text-foreground text-center">No Trainer Found!</h1>
        <p className="text-foreground/50 text-center">Complete the quiz first to enter battle.</p>
        <button onClick={() => router.push('/quiz/name')} className="btn-primary flex items-center gap-2">
          <Zap className="w-4 h-4" /> Take the Quiz
        </button>
      </div>
    );
  }

  const pokemon = generatedCard.matchedPokemon;
  const typeTheme = TYPE_COLORS[pokemon.primaryType];
  const artUrl = pokemon.sprites.official_artwork
    ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const startBattle = () => {
    if (!selectedOpponent) return;
    const opp = selectedOpponent;
    const res = computeBattle(
      generatedCard.powerScore,
      generatedCard.rarity,
      opp.pokemon.power,
      opp.pokemon.rarity,
    );
    setResult(res);
    const logs = [
      `⚔️ ${generatedCard.trainerName} vs ${opp.name}!`,
      `🔥 ${pokemon.displayName} charges forward!`,
      `💥 ${opp.pokemon.displayName} retaliates!`,
      `✨ ${res.mvpMove} connects!`,
      res.playerWon
        ? `🏆 ${pokemon.displayName} wins the battle!`
        : `💔 ${opp.pokemon.displayName} takes the victory!`,
    ];
    setBattleLog(logs);
    setLogIdx(0);
    setPhase('battling');
    logs.forEach((_, i) => {
      setTimeout(() => setLogIdx(i + 1), i * 900);
    });
    setTimeout(() => setPhase('result'), logs.length * 900 + 500);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-16 relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse at top, ${typeTheme.bg} 0%, #0a0b0f 65%)` }}
    >
      {/* Ambient */}
      <div className="fixed top-1/2 left-1/4 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20" style={{ background: typeTheme.primary }} />
      {result && (
        <div className="fixed top-1/2 right-1/4 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-15" style={{ background: selectedOpponent?.color }} />
      )}

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass border border-white/10 rounded-full px-4 py-2 text-sm text-foreground/60 mb-4">
            <Swords className="w-3.5 h-3.5" /> Battle Simulator
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {phase === 'result'
              ? result?.playerWon ? '🏆 Victory!' : '💔 Defeat…'
              : 'Choose Your Opponent'}
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Opponent selection */}
          {phase === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -40 }}
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {OPPONENTS.map((opp) => (
                  <motion.button
                    key={opp.name}
                    onClick={() => { setSelectedOpponent(opp); setPhase('preview'); }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card rounded-2xl p-5 text-left hover:border-white/20 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: `${opp.color}20`, border: `1px solid ${opp.color}40` }}
                      >
                        {opp.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{opp.name}</p>
                        <p className="text-xs text-foreground/40">{opp.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-foreground/70">{opp.pokemon.displayName}</p>
                        <p className="text-xs text-foreground/40">Style: {opp.style}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: opp.color }}>
                          PWR {opp.pokemon.power.toLocaleString()}
                        </p>
                        <p className="text-xs text-foreground/40">{opp.pokemon.rarity}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
                
                {/* Challenge a Friend Tile */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="glass-card rounded-2xl p-5 text-center flex flex-col items-center justify-center border border-dashed border-brand-500/50 bg-brand-500/10 hover:bg-brand-500/20 transition-all cursor-pointer"
                  onClick={handleCopyChallengeLink}
                >
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 mb-3">
                    {copiedLink ? <Check className="w-6 h-6" /> : <LinkIcon className="w-6 h-6" />}
                  </div>
                  <p className="font-bold text-foreground mb-1">Challenge a Friend</p>
                  <p className="text-xs text-foreground/50 mb-3 px-2">Generate a battle link to pit your cards against each other.</p>
                  <div className="text-xs font-bold text-brand-400 bg-brand-500/20 px-3 py-1.5 rounded-full">
                    {copiedLink ? 'Link Copied!' : 'Copy Battle Link'}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Battle preview */}
          {phase === 'preview' && selectedOpponent && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* VS display */}
              <div className="flex items-center gap-4 justify-center">
                {/* Player side */}
                <motion.div
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 glass-card rounded-2xl p-6 text-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={artUrl} alt={pokemon.displayName} className="w-24 h-24 object-contain mx-auto" style={{ filter: `drop-shadow(0 0 12px ${typeTheme.glow})` }} />
                  <p className="font-bold text-foreground mt-2">{pokemon.displayName}</p>
                  <p className="text-xs text-foreground/50">{generatedCard.trainerName}</p>
                  <p className="text-sm font-bold mt-2" style={{ color: typeTheme.text }}>
                    PWR {generatedCard.powerScore.toLocaleString()}
                  </p>
                  <p className="text-xs text-foreground/40">{generatedCard.rarity}</p>
                </motion.div>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex-shrink-0 text-4xl font-display font-bold text-foreground"
                >
                  VS
                </motion.div>

                {/* Opponent side */}
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex-1 glass-card rounded-2xl p-6 text-center"
                >
                  <div className="text-6xl mb-2">{selectedOpponent.avatar}</div>
                  <p className="font-bold text-foreground">{selectedOpponent.pokemon.displayName}</p>
                  <p className="text-xs text-foreground/50">{selectedOpponent.name}</p>
                  <p className="text-sm font-bold mt-2" style={{ color: selectedOpponent.color }}>
                    PWR {selectedOpponent.pokemon.power.toLocaleString()}
                  </p>
                  <p className="text-xs text-foreground/40">{selectedOpponent.pokemon.rarity}</p>
                </motion.div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('select')}
                  className="flex-1 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground text-sm transition-all"
                >
                  ← Back
                </button>
                <motion.button
                  onClick={startBattle}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${typeTheme.primary}, ${selectedOpponent.color})` }}
                >
                  <Swords className="w-4 h-4" /> BATTLE!
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Battle log animation */}
          {phase === 'battling' && (
            <motion.div
              key="battling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card rounded-2xl p-8 space-y-4 min-h-[300px]"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-4xl inline-block"
                >
                  ⚔️
                </motion.div>
              </div>
              <div className="space-y-3">
                {battleLog.slice(0, logIdx).map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <span className="text-sm text-foreground/80">{log}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Result */}
          {phase === 'result' && result && selectedOpponent && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Winner banner */}
              <motion.div
                className="glass-card rounded-2xl p-8 text-center"
                style={{
                  border: result.playerWon
                    ? `1px solid ${typeTheme.primary}60`
                    : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div className="text-6xl mb-4">{result.playerWon ? '🏆' : '💔'}</div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {result.playerWon ? `${pokemon.displayName} Wins!` : `${selectedOpponent.pokemon.displayName} Wins!`}
                </h2>
                <p className="text-foreground/60 text-sm max-w-md mx-auto">{result.summary}</p>

                {/* Win probability */}
                <div className="mt-6 flex items-center gap-3 justify-center">
                  <span className="text-xs text-foreground/40">Win Probability</span>
                  <div className="flex-1 max-w-xs h-2 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: typeTheme.primary }}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.winProbability}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-sm font-bold" style={{ color: typeTheme.text }}>
                    {result.winProbability}%
                  </span>
                </div>
              </motion.div>

              {/* Stats comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5" style={{ border: result.playerWon ? `1px solid ${typeTheme.primary}40` : undefined }}>
                  <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    {result.playerWon && <Trophy className="w-3 h-3 text-yellow-400" />}
                    {pokemon.displayName}
                  </h3>
                  <HPBar current={result.playerHP} color={typeTheme.primary} />
                  <div className="mt-3 text-sm">
                    <span className="text-foreground/40">MVP Move: </span>
                    <span className="text-foreground/80 font-medium">{result.mvpMove}</span>
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-xs text-foreground/40 uppercase tracking-wider mb-3">
                    {selectedOpponent.pokemon.displayName}
                  </h3>
                  <HPBar current={result.opponentHP} color={selectedOpponent.color} />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setPhase('select'); setSelectedOpponent(null); setResult(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Fight Again
                </button>
                <button
                  onClick={() => router.push('/card')}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> View Card
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
