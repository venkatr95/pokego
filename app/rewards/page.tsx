'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDailyStore } from '@/store/daily-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function RewardsPage() {
  const router = useRouter();
  const { streak, lastClaimDate, rewards, claimReward } = useDailyStore();
  const { addXP, recordLogin } = useAchievementsStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    recordLogin();
  }, [recordLogin]);

  const today = new Date().toDateString();
  const canClaim = lastClaimDate !== today;

  const handleClaim = () => {
    if (!canClaim) return;
    
    const targetDay = (streak % 5) + 1;
    const reward = rewards.find(r => r.day === targetDay);
    
    claimReward();
    
    if (reward?.type === 'xp' && reward.amount) {
      addXP(reward.amount);
    }
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] pt-24 pb-16 px-6">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-8">
        <button
          onClick={() => router.back()}
          className="text-foreground/50 hover:text-foreground flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            🎁
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Daily Rewards</h1>
            <p className="text-foreground/60 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" /> Current Streak: <strong className="text-pink-400">{streak} Days!</strong>
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="grid grid-cols-5 gap-3">
            {rewards.map((r) => {
              const isActive = (streak % 5) + 1 === r.day && canClaim;
              const isPast = r.claimed;
              
              return (
                <div
                  key={r.day}
                  className={`flex flex-col items-center p-3 rounded-xl border relative transition-all ${
                    isActive
                      ? 'bg-foreground/10 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                      : isPast
                      ? 'bg-background/30 border-white/5 opacity-50'
                      : 'bg-foreground/5 border-white/10'
                  }`}
                >
                  {isPast && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl z-10">
                      <span className="text-2xl">✅</span>
                    </div>
                  )}
                  <span className="text-xs text-foreground/50 mb-2 uppercase font-bold tracking-wider">Day {r.day}</span>
                  <div className="text-3xl mb-2">
                    {r.type === 'xp' ? '⭐' : r.type === 'theme' ? '🎨' : '❓'}
                  </div>
                  <span className="text-xs font-bold text-center text-foreground/80">
                    {r.type === 'xp' ? `+${r.amount} XP` : r.type === 'theme' ? 'Gold Theme' : 'Mystery'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleClaim}
              disabled={!canClaim}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                canClaim
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-foreground shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:scale-[1.02]'
                  : 'glass border border-white/10 text-foreground/40 cursor-not-allowed'
              }`}
            >
              {canClaim ? (
                <>
                  <Sparkles className="w-5 h-5" /> Claim Reward
                </>
              ) : (
                'Come Back Tomorrow!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
