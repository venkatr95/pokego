'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useQuizStore } from '@/store/quiz-store';
import { LoginButton } from '@/components/auth/LoginButton';

export function Navbar() {
  const resetQuiz = useQuizStore((s) => s.resetQuiz);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={resetQuiz}
          className="flex items-center gap-2 font-display font-bold text-xl group"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0"
          >
            <Zap className="w-4 h-4 text-foreground" />
          </motion.div>
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent truncate hidden sm:block">
            PokéYou
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-foreground/60">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link href="/quiz" className="hover:text-foreground transition-colors">Take Quiz</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* <ThemeToggle /> disabled as requested */}
          {/* <LoginButton /> disabled as requested */}
          <Link
            href="/quiz"
            className="btn-primary text-xs py-1.5 px-3 md:text-sm md:py-2 md:px-5"
          >
            Start Quiz
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
