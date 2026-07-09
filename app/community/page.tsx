'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type CommunityCard = {
  id: string | number;
  pokemon: string;
  theme: string;
  trainer: string;
  rarity: string;
  likes: number;
};

export default function CommunityPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('cards')
          .select('id, name, theme, users(username)')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) console.error(error);

        if (data && data.length > 0) {
          setPosts(data.map((card: { id: string, name: string, theme: string, users?: any }) => {
            const username = Array.isArray(card.users) ? card.users[0]?.username : card.users?.username;
            return {
              id: card.id,
              pokemon: card.name,
              theme: card.theme,
              trainer: username || 'Trainer',
              rarity: 'Rare', 
              likes: Math.floor(Math.random() * 100), 
            };
          }));
        } else {
          setPosts([
            { id: 1, trainer: 'AshK', pokemon: 'Charizard', rarity: 'Legendary', likes: 124, theme: 'gold-secret' },
            { id: 2, trainer: 'MistyW', pokemon: 'Starmie', rarity: 'Rare', likes: 89, theme: 'vmax' },
            { id: 3, trainer: 'BrockR', pokemon: 'Onix', rarity: 'Uncommon', likes: 230, theme: 'classic-tcg' },
            { id: 4, trainer: 'DawnS', pokemon: 'Piplup', rarity: 'Epic', likes: 156, theme: 'rainbow-rare' },
            { id: 5, trainer: 'GaryO', pokemon: 'Blastoise', rarity: 'Rare', likes: 342, theme: 'gx' },
            { id: 6, trainer: 'Cynthia', pokemon: 'Garchomp', rarity: 'Mythic', likes: 892, theme: 'pixel-art' },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch community cards', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCards();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0b0f] pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
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

        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            <Users className="w-10 h-10 text-foreground" />
          </motion.div>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Community Hub</h1>
            <p className="text-foreground/60">Discover and get inspired by other trainers.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center pt-16 text-foreground/50">Loading community...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {posts.map((post, i) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 hover:border-white/20 transition-colors group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center font-bold text-xs">
                      {post.trainer.charAt(0)}
                    </div>
                    <span className="font-bold text-foreground/80 text-sm">{post.trainer}</span>
                  </div>
                  <span className="text-xs bg-foreground/10 px-2 py-1 rounded border border-white/5 text-foreground/60">
                    {post.theme}
                  </span>
                </div>
                
                {/* Mock Card Preview */}
                <div className="aspect-[63/88] w-full rounded-xl bg-background/40 border border-white/5 flex flex-col items-center justify-center mb-4 group-hover:bg-foreground/5 transition-colors relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5" />
                   <span className="text-4xl mb-2">🎴</span>
                   <span className="font-display font-bold">{post.pokemon}</span>
                   <span className="text-xs text-brand-400">{post.rarity}</span>
                </div>
                
                <div className="flex items-center justify-between text-foreground/50 text-sm">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 hover:text-pink-400 transition-colors">
                      <Heart className="w-4 h-4" /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" /> {Math.floor(post.likes / 10)}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
