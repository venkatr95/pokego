'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Zap, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(
  () => import('./ParticleBackground').then((mod) => mod.ParticleBackground),
  { ssr: false }
);

const FEATURE_CARDS = [
  { emoji: '✨', title: 'Personality Matching', desc: 'Our algorithm analyzes your answers and matches you to the Pokémon that resonates most with your unique traits.' },
  { emoji: '🃏', title: 'Premium Card', desc: 'Get a stunning holographic trading card with glassmorphism effects, animated stats, and rarity badges.' },
  { emoji: '🤖', title: 'AI Insights', desc: 'AI generates a personalized story, trainer title, signature move, and deep personality analysis just for you.' },
  { emoji: '📤', title: 'Share & Download', desc: 'Download in multiple formats or share your card on social media with one click.' },
];

const EXAMPLE_POKEMON = [
  { name: 'Charizard', type: 'fire', color: '#F08030', num: '006', art: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' },
  { name: 'Mewtwo',    type: 'psychic', color: '#F85888', num: '150', art: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png' },
  { name: 'Lucario',   type: 'fighting', color: '#C03028', num: '448', art: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png' },
  { name: 'Eevee',     type: 'normal', color: '#A8A878', num: '133', art: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' },
  { name: 'Gengar',    type: 'ghost', color: '#705898', num: '094', art: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png' },
];

const FAQ_ITEMS = [
  { q: 'How does the personality matching work?', a: 'Your answers are weighted and mapped to personality traits. Each Pokémon has trait affinity scores. We calculate a composite match score and pick the best fit.' },
  { q: 'What if my favorite Pokémon doesn\'t win?', a: 'We apply a bonus to your favorite Pokémon. If it still loses, the AI explains why your personality resonates even more with the matched Pokémon.' },
  { q: 'Is the AI analysis free?', a: 'Yes! Simply add your own API key to enable full AI features. Without it, we use our built-in personality engine to generate a personalized analysis.' },
  { q: 'Can I download my card?', a: 'Absolutely. Download as PNG, JPEG, or PDF in multiple sizes including standard Pokémon card dimensions for printing.' },
  { q: 'How many Pokémon are supported?', a: 'All 1025 Pokémon from Generation I through IX are supported, including legendaries, mythicals, and regional forms.' },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
      <ParticleBackground />

      {/* Gradient orbs - Hidden on mobile for performance */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none hidden md:block" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none hidden md:block" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 glass border border-brand-500/30 rounded-full px-4 py-2 text-sm text-brand-300 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1025 Pokémon · AI Personality Analysis · Premium Cards</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
        >
          Discover Your{' '}
          <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Pokémon
          </span>
          <br />
          Personality
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-10"
        >
          Answer five questions and generate your own premium animated Pokémon
          trading card — personalized to your unique personality.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/quiz" className="btn-primary flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" />
            Start Quiz
            <ChevronRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="text-foreground/60 hover:text-foreground transition-colors text-sm flex items-center gap-1"
          >
            See how it works ↓
          </a>
        </motion.div>

        {/* Floating Pokémon cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex justify-center gap-4 flex-wrap"
        >
          {EXAMPLE_POKEMON.map((p, i) => (
            <motion.div
              key={p.name}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4,
              }}
              className="relative"
            >
              <div
                className="glass-card rounded-2xl p-3 w-28 h-36 flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-transform"
                style={{ borderColor: p.color + '40', boxShadow: `0 0 20px ${p.color}30` }}
              >
                <span className="text-xs text-foreground/40 font-mono">#{p.num}</span>
                <Image src={p.art} alt={p.name} width={64} height={64} className="w-16 h-16 object-contain" priority />
                <span className="text-xs font-semibold text-foreground/80">{p.name}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features section */}
      <section id="features" className="relative z-10 mt-24 w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything you need for your{' '}
            <span className="text-brand-400">perfect card</span>
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            Premium features, beautiful animations, and AI-powered personalization.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CARDS.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:border-brand-500/30 transition-all"
            >
              <div className="text-3xl mb-4">{f.emoji}</div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mt-24 w-full max-w-3xl mx-auto pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.details
              key={item.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl px-6 py-4 group cursor-pointer"
            >
              <summary className="font-semibold text-foreground/90 list-none flex items-center justify-between gap-4">
                {item.q}
                <ChevronRight className="w-4 h-4 text-foreground/40 group-open:rotate-90 transition-transform flex-shrink-0" />
              </summary>
              <p className="mt-3 text-sm text-foreground/60 leading-relaxed">{item.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative z-10 w-full max-w-4xl mx-auto"
      >
        <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-purple-600/20 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold mb-4">
              Ready to discover your Pokémon?
            </h2>
            <p className="text-foreground/60 mb-8">Takes less than 2 minutes. Free forever.</p>
            <Link href="/quiz" className="btn-primary text-base inline-flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Start Your Journey
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 text-center text-sm text-foreground/30">
        <p>PokéYou · Fan project · Not affiliated with Nintendo or The Pokémon Company</p>
        <p className="mt-1">Pokémon and all related names are trademarks of Nintendo/Creatures/GAME FREAK.</p>
      </footer>
    </section>
  );
}
