'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Check, Star, Zap, Image as ImageIcon } from 'lucide-react';

const FEATURES = [
  { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'Unlimited Generations', desc: 'No daily limits on taking the quiz and generating cards.' },
  { icon: <Star className="w-5 h-5 text-brand-400" />, title: 'Shiny Boost', desc: '10x higher chance to generate a Shiny Pokémon card.' },
  { icon: <ImageIcon className="w-5 h-5 text-pink-400" />, title: 'Premium Backgrounds', desc: 'Access exclusive animated holographic backgrounds.' },
  { icon: <Check className="w-5 h-5 text-green-400" />, title: 'Physical Print Discount', desc: 'Get 50% off if you decide to print a physical holographic card.' },
];

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'anonymous' }), // Will be actual user ID when integrated with Supabase auth session
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout failed.');
      }
    } catch (err) {
      console.error('Error starting checkout', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
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
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(250,204,21,0.4)]"
          >
            <Sparkles className="w-10 h-10 text-foreground" />
          </motion.div>
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">PokéYou <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Premium</span></h1>
            <p className="text-foreground/60">Unlock the ultimate trainer experience.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center pt-8">
          <div className="space-y-6">
            {FEATURES.map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="mt-1 p-2 bg-foreground/5 rounded-xl border border-white/10">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{feat.title}</h3>
                  <p className="text-foreground/50 text-sm">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-8 border-yellow-500/40 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/40">
                Most Popular
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">Pro Trainer</h2>
            <div className="flex items-end gap-1 mb-6">
              <span className="text-5xl font-bold text-foreground">$5</span>
              <span className="text-foreground/50 mb-1">/month</span>
            </div>

            <button 
              className="w-full py-4 rounded-xl font-bold text-foreground mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(234,179,8,0.4)] disabled:opacity-50"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
            
            <p className="text-center text-xs text-foreground/40">Cancel anytime. Secure checkout via Stripe.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
