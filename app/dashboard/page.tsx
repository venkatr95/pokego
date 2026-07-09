'use client';

import { useQuizStore } from '@/store/quiz-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { useDailyStore } from '@/store/daily-store';
import { Trophy, Gift, ArrowRight, Home, CreditCard, Sparkles, Map } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { generatedCard } = useQuizStore();
  const { totalXP, achievements } = useAchievementsStore();
  const { streak } = useDailyStore();
  
  const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="min-h-screen bg-[#0a0b0f] pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Trainer Dashboard</h1>
            <p className="text-foreground/60">Welcome back! Here&apos;s your progress.</p>
          </div>
          <Link href="/" className="glass px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-foreground/10 transition-colors">
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/achievements" className="glass-card rounded-2xl p-5 hover:border-yellow-500/40 transition-colors block">
            <div className="text-yellow-400 mb-2"><Trophy className="w-6 h-6" /></div>
            <p className="text-2xl font-bold text-foreground">{totalXP} XP</p>
            <p className="text-xs text-foreground/50">{unlockedAchievements} Achievements</p>
          </Link>
          
          <Link href="/rewards" className="glass-card rounded-2xl p-5 hover:border-pink-500/40 transition-colors block">
            <div className="text-pink-400 mb-2"><Gift className="w-6 h-6" /></div>
            <p className="text-2xl font-bold text-foreground">{streak} Days</p>
            <p className="text-xs text-foreground/50">Login Streak</p>
          </Link>

          <Link href="/card" className="glass-card rounded-2xl p-5 hover:border-brand-500/40 transition-colors block">
            <div className="text-brand-400 mb-2"><CreditCard className="w-6 h-6" /></div>
            <p className="text-lg font-bold text-foreground">My Card</p>
            <p className="text-xs text-foreground/50">View Active Card</p>
          </Link>
          
          <Link href="/premium" className="glass-card rounded-2xl p-5 border-yellow-500/30 hover:border-yellow-500/60 bg-yellow-500/5 transition-colors block">
            <div className="text-yellow-400 mb-2"><Sparkles className="w-6 h-6" /></div>
            <p className="text-lg font-bold text-foreground">Go Premium</p>
            <p className="text-xs text-foreground/50">Unlock all features</p>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Card */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Latest Card</h2>
            {generatedCard ? (
              <div className="flex gap-4 items-center p-4 bg-foreground/5 rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={generatedCard.matchedPokemon.sprites.official_artwork ?? ''} 
                  alt={generatedCard.matchedPokemon.displayName}
                  className="w-16 h-16 object-contain drop-shadow-md"
                />
                <div>
                  <p className="font-bold text-foreground">{generatedCard.matchedPokemon.displayName}</p>
                  <p className="text-sm text-foreground/60">Rarity: {generatedCard.rarity}</p>
                </div>
                <Link href="/card" className="ml-auto glass p-2 rounded-full hover:bg-foreground/10">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center p-6 bg-foreground/5 rounded-xl border border-dashed border-white/20">
                <p className="text-foreground/50 text-sm mb-4">No cards generated yet.</p>
                <Link href="/quiz/name" className="btn-primary text-sm py-2 px-4 inline-flex">
                  Take the Quiz
                </Link>
              </div>
            )}
          </div>

          {/* Hub Navigation */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Explore</h2>
            <div className="space-y-3">
              <Link href="/community" className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Map className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-bold text-foreground text-sm">Community Hub</p>
                    <p className="text-xs text-foreground/50">See what others are matching with</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/40" />
              </Link>
              
              <Link href="/leaderboard" className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl hover:bg-foreground/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="font-bold text-foreground text-sm">Global Leaderboard</p>
                    <p className="text-xs text-foreground/50">Top trainers by XP</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground/40" />
              </Link>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
