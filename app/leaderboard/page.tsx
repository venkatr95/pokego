'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Star } from 'lucide-react';
import { useAchievementsStore } from '@/store/achievements-store';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AdUnit } from '@/components/ads/AdUnit';

type LeaderboardUser = {
  rank: number;
  id: string;
  username: string;
  xp: number;
};

export default function LeaderboardPage() {
  const router = useRouter();
  const { totalXP } = useAchievementsStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('users')
          .select('id, username, xp')
          .order('xp', { ascending: false })
          .limit(10);
        
        if (error) console.error(error);

        if (data && data.length > 0) {
          setLeaderboard(data.map((user, index) => ({
            rank: index + 1,
            id: user.id,
            xp: user.xp,
            username: user.username || 'Anonymous Trainer'
          })));
        } else {
          // Fallback to mock if database is empty or not connected
          setLeaderboard([
            { rank: 1, id: '1', username: 'Red', xp: 9999 },
            { rank: 2, id: '2', username: 'Blue', xp: 8500 },
            { rank: 3, id: '3', username: 'Cynthia', xp: 8450 },
            { rank: 4, id: '4', username: 'Leon', xp: 8200 },
            { rank: 5, id: '5', username: 'Steven', xp: 7900 },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);
  
  // Insert player loosely based on XP
  const playerRank = totalXP > 0 ? (totalXP > 1000 ? 6 : 4892) : 'Unranked';

  return (
    <div className="min-h-screen bg-[#0a0b0f] pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-foreground/50 hover:text-foreground flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          
          <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm">
            My Dashboard
          </Link>
        </div>

        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Leaderboard', href: '/leaderboard' }]} />

        <div className="flex justify-center mb-8">
          <AdUnit slotId="leaderboard-top" width={728} height={90} className="hidden md:flex" />
          <AdUnit slotId="leaderboard-top-mobile" width={320} height={50} className="md:hidden" />
        </div>

        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(250,204,21,0.3)]"
          >
            <Trophy className="w-10 h-10 text-foreground" />
          </motion.div>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Global Leaderboard</h1>
            <p className="text-foreground/60">The strongest trainers in the world.</p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-2 sm:p-6">
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-foreground/40 uppercase tracking-wider hidden sm:grid">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-6">Trainer</div>
              <div className="col-span-4 text-right">Experience</div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-foreground/50">Loading leaderboard...</div>
            ) : (
              leaderboard.map((player, i) => (
                <motion.div 
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`grid grid-cols-12 gap-4 items-center p-4 rounded-xl border ${
                    player.rank === 1 ? 'bg-yellow-500/10 border-yellow-500/30' :
                    player.rank === 2 ? 'bg-gray-400/10 border-gray-400/30' :
                    player.rank === 3 ? 'bg-orange-700/10 border-orange-700/30' :
                    'bg-foreground/5 border-white/5'
                  }`}
                >
                  <div className="col-span-2 text-center font-bold text-xl">
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : <span className="text-foreground/40">#{player.rank}</span>}
                  </div>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background/40 flex items-center justify-center text-lg">
                      {player.rank === 1 ? '🔴' : player.rank === 2 ? '🔵' : '👤'}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{player.username}</p>
                    </div>
                  </div>
                  <div className="col-span-4 text-right font-display text-lg font-bold text-yellow-400">
                    {player.xp.toLocaleString()} XP
                  </div>
                </motion.div>
              ))
            )}

            {/* Current Player */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-foreground text-xs font-bold px-3 py-1 rounded-full">
                YOU
              </div>
              <div className="grid grid-cols-12 gap-4 items-center p-4 rounded-xl border border-brand-500/50 bg-brand-500/10 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                <div className="col-span-2 text-center font-bold text-brand-400">
                  {playerRank === 'Unranked' ? '-' : `#${playerRank}`}
                </div>
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Guest Trainer</p>
                    <p className="text-xs text-brand-400/70 hidden sm:block">Current Progress</p>
                  </div>
                </div>
                <div className="col-span-4 text-right font-display text-lg font-bold text-yellow-400">
                  {totalXP.toLocaleString()} XP
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
