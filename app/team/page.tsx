'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { TYPE_COLORS } from '@/types/pokemon';
import { Users, Zap, Shield, Sword, Heart, FastForward, Activity } from 'lucide-react';
import type { RecommendedTeamMember } from '@/types/card';

// Simplified role assignment based on stats and reason text
function guessRole(reason: string) {
  const r = reason.toLowerCase();
  if (r.includes('protect') || r.includes('defend') || r.includes('shield')) return { role: 'Tank', icon: <Shield className="w-3 h-3" />, color: '#3b82f6' };
  if (r.includes('strike') || r.includes('attack') || r.includes('power')) return { role: 'Attacker', icon: <Sword className="w-3 h-3" />, color: '#ef4444' };
  if (r.includes('support') || r.includes('heal') || r.includes('help')) return { role: 'Support', icon: <Heart className="w-3 h-3" />, color: '#10b981' };
  if (r.includes('fast') || r.includes('speed') || r.includes('quick')) return { role: 'Speed', icon: <FastForward className="w-3 h-3" />, color: '#f59e0b' };
  return { role: 'Flex', icon: <Activity className="w-3 h-3" />, color: '#8b5cf6' };
}

export default function TeamBuilderPage() {
  const router = useRouter();
  const { generatedCard } = useQuizStore();
  const { updateProgress } = useAchievementsStore();

  useEffect(() => {
    if (generatedCard) {
      updateProgress('team_built');
    }
  }, [generatedCard, updateProgress]);

  if (!generatedCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-6xl mb-4">👥</div>
        <h1 className="font-display text-2xl font-bold text-foreground text-center">No Team Data Found</h1>
        <p className="text-foreground/50 text-center">Complete the personality quiz to generate your dream team.</p>
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
  
  const team: RecommendedTeamMember[] = generatedCard.aiData?.recommendedTeam ?? [];
  // Ensure we have exactly 5 members (plus the matched pokemon = 6)
  const fullTeam = [
    {
      name: pokemon.displayName,
      reason: generatedCard.aiData?.pokemonReasoning ?? `The perfect match for your ${generatedCard.personality.dominantTraits[0]} personality.`,
      isLeader: true
    },
    ...team.map(t => ({ ...t, isLeader: false }))
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-16 relative overflow-x-hidden"
      style={{ background: `radial-gradient(ellipse at top, ${typeTheme.bg} 0%, #0a0b0f 65%)` }}
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 glass border border-white/10 rounded-full px-4 py-2 text-sm text-foreground/60 mb-4">
            <Users className="w-3.5 h-3.5" /> AI Team Builder
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Your Dream Team</h1>
          <p className="text-foreground/50 mt-2 max-w-lg mx-auto">
            Based on your {generatedCard.aiData?.battleStyle ?? 'unique'} battle style and {generatedCard.personality.dominantTraits[0]} nature, 
            we&apos;ve assembled the perfect team of 6 to complement your strengths.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fullTeam.map((member, i) => {
            const role = guessRole(member.reason);
            const isLeader = member.isLeader;
            
            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl overflow-hidden relative group"
                style={{
                  border: isLeader ? `2px solid ${typeTheme.primary}60` : '1px solid rgba(255,255,255,0.1)',
                  background: isLeader ? 'rgba(255,255,255,0.05)' : undefined
                }}
              >
                {/* Background glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${isLeader ? typeTheme.primary : '#ffffff'}20 0%, transparent 70%)` }}
                />

                {/* Number / Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ 
                      background: isLeader ? typeTheme.primary : 'rgba(255,255,255,0.1)',
                      color: isLeader ? '#fff' : 'rgba(255,255,255,0.6)'
                    }}
                  >
                    #{i + 1}
                  </div>
                </div>

                {isLeader && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(255,215,0,0.2)', color: '#ffd700' }}>
                      Partner
                    </span>
                  </div>
                )}

                {/* Top Section: Art placeholder / Real art for partner */}
                <div 
                  className="h-32 flex items-center justify-center relative overflow-hidden"
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: isLeader ? `radial-gradient(ellipse at bottom, ${typeTheme.bg} 0%, transparent 100%)` : 'rgba(0,0,0,0.2)'
                  }}
                >
                  {isLeader ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={artUrl} 
                      alt={pokemon.displayName} 
                      className="w-24 h-24 object-contain"
                      style={{ filter: `drop-shadow(0 4px 12px ${typeTheme.glow})` }}
                    />
                  ) : (
                    <div className="text-4xl opacity-40">🔵</div>
                  )}
                </div>

                {/* Bottom Section: Info */}
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all">
                    {member.name}
                  </h3>
                  
                  {/* Role Badge */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <span 
                      className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md"
                      style={{ background: `${role.color}20`, color: role.color }}
                    >
                      {role.icon} {role.role}
                    </span>
                  </div>

                  <p className="text-sm text-foreground/60 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                    {member.reason}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Empty slots if AI returned less than 5 recommendations */}
          {Array.from({ length: Math.max(0, 6 - fullTeam.length) }).map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center min-h-[300px]"
              style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-foreground/20 text-2xl mb-4">
                ?
              </div>
              <p className="text-foreground/40 font-medium">Empty Slot</p>
              <p className="text-foreground/30 text-xs mt-2">Generate a new card to fill out your team</p>
            </motion.div>
          ))}
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center"
        >
          <button
            onClick={() => router.push('/card')}
            className="px-6 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground transition-all text-sm"
          >
            ← Back to Card
          </button>
        </motion.div>
      </div>
    </div>
  );
}
