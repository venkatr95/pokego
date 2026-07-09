'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { TYPE_COLORS } from '@/types/pokemon';
import { BookOpen, MapPin, Zap, Star, Compass } from 'lucide-react';

export default function StoryPage() {
  const router = useRouter();
  const { generatedCard } = useQuizStore();

  if (!generatedCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="font-display text-2xl font-bold text-foreground text-center">No Story Found</h1>
        <p className="text-foreground/50 text-center">Complete the personality quiz to discover your origin story.</p>
        <button onClick={() => router.push('/quiz/name')} className="btn-primary flex items-center gap-2">
          <Zap className="w-4 h-4" /> Take the Quiz
        </button>
      </div>
    );
  }

  const pokemon = generatedCard.matchedPokemon;
  const typeTheme = TYPE_COLORS[pokemon.primaryType];
  const story = generatedCard.aiData?.story ?? `You and ${pokemon.displayName} met on a fateful day...`;

  // Split story into pseudo-chapters based on sentences for timeline effect
  const sentences = story.match(/[^.!?]+[.!?]+/g) || [story];
  const chapters = sentences.reduce((acc: string[], sentence: string, i: number) => {
    if (i % 2 === 0) {
      acc.push(sentence.trim());
    } else {
      acc[acc.length - 1] += ' ' + sentence.trim();
    }
    return acc;
  }, []);

  const timelineIcons = [
    <MapPin key="1" className="w-4 h-4" />,
    <Compass key="2" className="w-4 h-4" />,
    <Star key="3" className="w-4 h-4" />,
    <Zap key="4" className="w-4 h-4" />,
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-24 pb-32 relative"
      style={{ background: `radial-gradient(ellipse at top, ${typeTheme.bg} 0%, #0a0b0f 80%)` }}
    >
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass border border-white/10 rounded-full px-4 py-2 text-sm text-foreground/60 mb-6">
            <BookOpen className="w-3.5 h-3.5" /> Adventure Timeline
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            The Tale of {generatedCard.trainerName} <br/>
            <span className="text-2xl md:text-3xl text-foreground/50">& {pokemon.displayName}</span>
          </h1>
          <p className="text-foreground/40 uppercase tracking-widest text-xs">
            Region: {generatedCard.aiData?.region ?? 'Unknown'}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div 
            className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 opacity-20"
            style={{ background: `linear-gradient(to bottom, transparent, ${typeTheme.primary}, transparent)` }}
          />

          <div className="space-y-12">
            {chapters.map((chapter, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex flex-col md:flex-row gap-8 items-center md:items-start ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
                       style={{ background: '#0a0b0f', border: `2px solid ${typeTheme.primary}` }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ background: `${typeTheme.primary}20`, color: typeTheme.primary }}>
                      {timelineIcons[i % timelineIcons.length]}
                    </div>
                  </div>

                  {/* Content Box */}
                  <div className={`w-full md:w-1/2 pl-20 md:pl-0 ${isEven ? 'md:pr-12 text-left md:text-right' : 'md:pl-12 text-left'}`}>
                    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
                      <div className="absolute top-0 left-0 w-full h-1" style={{ background: typeTheme.primary, opacity: 0.5 }} />
                      <p className="text-foreground/80 leading-relaxed text-base md:text-lg font-medium">
                        {chapter}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* End of story marker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <div className="w-3 h-3 rounded-full mx-auto mb-8 animate-pulse" style={{ background: typeTheme.primary }} />
          <p className="text-foreground/40 italic font-display text-xl">The journey continues...</p>
          
          <button
            onClick={() => router.push('/card')}
            className="mt-8 px-6 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground transition-all text-sm inline-flex items-center gap-2"
          >
            ← Return to Card
          </button>
        </motion.div>
      </div>
    </div>
  );
}
