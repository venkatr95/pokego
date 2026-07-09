'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/store/quiz-store';
import { useAchievementsStore } from '@/store/achievements-store';
import { Sparkles, Zap, Brain, Star } from 'lucide-react';

const LOADING_STEPS = [
  { icon: Brain,    label: 'Analyzing your personality...', color: '#a78bfa' },
  { icon: Zap,      label: 'Matching your Pokémon...', color: '#fbbf24' },
  { icon: Sparkles, label: 'Generating AI insights...', color: '#f472b6' },
  { icon: Star,     label: 'Crafting your card...', color: '#34d399' },
];

export default function GeneratingPage() {
  const router = useRouter();
  const { answers, setGeneratedCard, setGenerating, setError } = useQuizStore();
  const { incrementCardsGenerated, updateProgress } = useAchievementsStore();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!answers.name || !answers.q1) {
      router.replace('/quiz/name');
      return;
    }

    let cancelled = false;

    const generate = async () => {
      setGenerating(true);

      // Animate through loading steps
      for (let i = 0; i < LOADING_STEPS.length; i++) {
        if (cancelled) return;
        setStep(i);
        setProgress((i / LOADING_STEPS.length) * 85);
        await new Promise((r) => setTimeout(r, 1200));
      }

      try {
        const res = await fetch('/api/generate-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });

        if (!res.ok) throw new Error('Generation failed');
        const { card } = await res.json();

        if (cancelled) return;
        setProgress(100);
        setGeneratedCard(card);
        incrementCardsGenerated();
        updateProgress('quiz_complete');
        await new Promise((r) => setTimeout(r, 500));
        router.push('/card');
      } catch {
        if (!cancelled) {
          setError('Something went wrong. Please try again.');
          router.push('/quiz');
        }
      } finally {
        if (!cancelled) setGenerating(false);
      }
    };

    generate();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CurrentIcon = LOADING_STEPS[step]?.icon ?? Sparkles;
  const currentColor = LOADING_STEPS[step]?.color ?? '#a78bfa';

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center px-6">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at center, ${currentColor}15 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Spinning ring */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              background: `conic-gradient(${currentColor}, transparent, ${currentColor})`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              padding: '2px',
              borderRadius: '50%',
            }}
          />
          <div
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{ background: `${currentColor}20` }}
          >
            <motion.div
              key={step}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <CurrentIcon className="w-10 h-10" style={{ color: currentColor }} />
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <motion.h2
          className="font-display text-2xl font-bold text-foreground mb-3"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Creating Your Card
        </motion.h2>

        {/* Current step label */}
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-foreground/60 mb-8"
        >
          {LOADING_STEPS[step]?.label}
        </motion.p>

        {/* Progress bar */}
        <div className="quiz-progress">
          <motion.div
            className="quiz-progress-fill"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${currentColor}, ${currentColor}aa)` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {LOADING_STEPS.map((s, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              animate={{
                background: i <= step ? s.color : 'rgba(255,255,255,0.1)',
                scale: i === step ? 1.3 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <p className="mt-8 text-sm text-foreground/30">
          {answers.name && `Crafting your card, ${answers.name}...`}
        </p>
      </div>
    </div>
  );
}
