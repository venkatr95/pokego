'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAchievementsStore } from '@/store/achievements-store';
import { ArrowLeft, Star } from 'lucide-react';

export default function AchievementsPage() {
  const router = useRouter();
  const { achievements, totalXP, recordLogin } = useAchievementsStore();

  useEffect(() => {
    recordLogin();
  }, [recordLogin]);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  const getRank = (xp: number) => {
    if (xp >= 1000) return 'Pokémon Master';
    if (xp >= 500) return 'Elite Four';
    if (xp >= 300) return 'Gym Leader';
    if (xp >= 100) return 'Ace Trainer';
    return 'Rookie';
  };

  const rank = getRank(totalXP);

  return (
    <div className="min-h-screen bg-[#0a0b0f] pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <button
          onClick={() => router.back()}
          className="text-foreground/50 hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(250,204,21,0.3)]"
          >
            🏆
          </motion.div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Trainer Profile</h1>
            <p className="text-foreground/60">Rank: <strong className="text-yellow-400">{rank}</strong></p>
            <p className="text-foreground/60 text-sm mt-1">{totalXP} XP Total</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Achievements ({unlockedCount}/{achievements.length})
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {achievements.map((ach) => {
              const isUnlocked = !!ach.unlockedAt;
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked 
                      ? 'bg-foreground/5 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                      : 'bg-background/20 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`text-4xl ${!isUnlocked && 'grayscale'}`}>
                      {ach.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-foreground text-sm">{ach.title}</h3>
                        <span className="text-xs font-bold text-yellow-500">+{ach.xpReward} XP</span>
                      </div>
                      <p className="text-foreground/50 text-xs mt-1 mb-3 leading-relaxed">
                        {ach.description}
                      </p>
                      <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(ach.progress / ach.maxProgress) * 100}%` }}
                          className={`h-full rounded-full ${isUnlocked ? 'bg-yellow-400' : 'bg-foreground/30'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
