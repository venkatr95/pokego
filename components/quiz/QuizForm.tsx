'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Sparkles, User, X } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import { QUIZ_QUESTIONS } from '@/types/quiz';
import type { QuizAnswers } from '@/types/quiz';
import type { PokemonSearchResult } from '@/types/pokemon';
import { TYPE_COLORS } from '@/types/pokemon';

const CHOICE_IDS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;
const QUESTION_ICONS: Record<string, string> = {
  q1: '🧩',
  q2: '🌍',
  q3: '⭐',
  q4: '🎭',
  q5: '💬',
};

function SectionHeader({
  icon,
  title,
  subtitle,
  done,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center shrink-0 text-xl sm:text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground leading-snug">
            {title}
          </h2>
          {done && (
            <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Done
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

export function QuizForm() {
  const router = useRouter();
  const { answers, setName, setFavoritePokemon, setAnswer, setStep } = useQuizStore();

  const [name, setLocalName] = useState(answers.name);
  const [nameError, setNameError] = useState('');
  const [formError, setFormError] = useState('');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PokemonSearchResult[]>([]);
  const [selected, setSelected] = useState<PokemonSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (answers.favoritePokemonId) {
      setSelected({
        id: answers.favoritePokemonId,
        name: answers.favoritePokemonName?.toLowerCase() ?? '',
        displayName: answers.favoritePokemonName ?? '',
        types: [],
        primaryType: 'normal',
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${answers.favoritePokemonId}.png`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/pokemon?q=${encodeURIComponent(q)}&limit=12`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void search(val), 250);
  };

  const handleSelectPokemon = (p: PokemonSearchResult) => {
    const withArt: PokemonSearchResult = {
      ...p,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
    };
    setSelected(withArt);
    setQuery('');
    setOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFavoritePokemon({ id: p.id, displayName: p.displayName } as any);
  };

  const handleClearPokemon = () => {
    setSelected(null);
    setFavoritePokemon(null);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const answeredCount = useMemo(() => {
    let n = 0;
    if (name.trim().length >= 2) n += 1;
    if (answers.favoritePokemonId) n += 1;
    for (const id of CHOICE_IDS) if (answers[id]) n += 1;
    return n;
  }, [answers, name]);

  const totalSections = 7;
  const isComplete = answeredCount === totalSections;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNameError('');

    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      document.getElementById('trainer-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!answers.favoritePokemonId) {
      setFormError('Please choose a Buddy Pokémon');
      document.getElementById('buddy-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    for (const id of CHOICE_IDS) {
      if (!answers[id]) {
        setFormError('Please answer every personality question');
        document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    setName(name.trim());
    setStep('complete');
    router.push('/generating');
  };

  const typeColor = selected?.primaryType ? TYPE_COLORS[selected.primaryType] : null;
  const choiceQuestions = QUIZ_QUESTIONS.filter((q) =>
    CHOICE_IDS.includes(q.id as (typeof CHOICE_IDS)[number])
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-28 sm:pb-8">
      {/* Progress */}
      <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Your progress</p>
          <p className="text-xs text-muted-foreground">
            {answeredCount} of {totalSections} sections complete
          </p>
        </div>
        <div className="w-28 sm:w-40 h-2 rounded-full bg-muted overflow-hidden shrink-0">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-[width] duration-300"
            style={{ width: `${(answeredCount / totalSections) * 100}%` }}
          />
        </div>
      </div>

      {/* Name */}
      <section className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8">
        <SectionHeader
          icon={<User className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600 dark:text-brand-400" />}
          title="What's your Trainer name?"
          subtitle="This will appear on your card"
          done={name.trim().length >= 2}
        />
        <input
          type="text"
          id="trainer-name"
          value={name}
          onChange={(e) => {
            setLocalName(e.target.value);
            setName(e.target.value);
          }}
          placeholder="Enter your trainer name..."
          autoComplete="given-name"
          enterKeyHint="next"
          className="w-full min-h-12 bg-background border border-border rounded-xl px-4 sm:px-5 py-3 text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        {nameError && <p className="text-destructive text-sm mt-2">{nameError}</p>}
      </section>

      {/* Buddy Pokémon */}
      <section id="buddy-section" className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8">
        <SectionHeader
          icon={<Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />}
          title="Choose your Buddy Pokémon"
          subtitle="Search by name or Pokédex number"
          done={!!answers.favoritePokemonId}
        />

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 relative glass rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
              style={typeColor ? { boxShadow: `0 0 24px ${typeColor.glow}` } : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.sprite ?? ''}
                alt=""
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{selected.displayName}</p>
                <p className="text-xs text-muted-foreground">Buddy selected</p>
              </div>
              <button
                type="button"
                onClick={handleClearPokemon}
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Clear buddy"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={handleInput}
            placeholder="Search Pokémon..."
            className="w-full min-h-12 bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              Searching…
            </span>
          )}
          {open && results.length > 0 && (
            <ul className="absolute z-30 mt-2 w-full max-h-56 sm:max-h-64 overflow-auto rounded-xl border border-border bg-popover shadow-lg overscroll-contain">
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPokemon(p)}
                    className="w-full min-h-12 flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent active:bg-accent transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        p.sprite ??
                        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
                      }
                      alt=""
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-sm font-medium text-foreground">{p.displayName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Personality questions */}
      {choiceQuestions.map((question) => {
        const current =
          answers[question.id as keyof Pick<QuizAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>];
        return (
          <section
            key={question.id}
            id={`section-${question.id}`}
            className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8"
          >
            <SectionHeader
              icon={<span>{QUESTION_ICONS[question.id] ?? '❓'}</span>}
              title={question.question}
              subtitle="Choose the one that feels most like you"
              done={!!current}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {question.options?.map((option) => {
                const selectedOpt = current === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setAnswer(
                        question.id as keyof Pick<QuizAnswers, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>,
                        option.id
                      )
                    }
                    className={`w-full min-h-14 flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all touch-manipulation ${
                      selectedOpt
                        ? 'bg-brand-500/20 border-brand-500/60 shadow-[0_0_20px_rgba(91,110,247,0.25)]'
                        : 'glass border-border hover:bg-accent active:bg-accent'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl shrink-0">{option.icon}</span>
                    <span
                      className={`font-semibold text-sm sm:text-base ${
                        selectedOpt ? 'text-foreground' : 'text-foreground/70'
                      }`}
                    >
                      {option.label}
                    </span>
                    <div className="ml-auto shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedOpt ? 'border-brand-400 bg-brand-400' : 'border-border'
                        }`}
                      >
                        {selectedOpt && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {formError && (
        <p className="text-destructive text-sm text-center px-2" role="alert">
          {formError}
        </p>
      )}

      {/* Sticky CTA — mobile-first */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:pt-2">
        <button
          type="submit"
          disabled={!isComplete}
          className="btn-primary w-full min-h-12 flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-xl touch-manipulation"
        >
          <Sparkles className="w-4 h-4" />
          Generate my Pokémon card
        </button>
        <p className="text-center text-xs text-muted-foreground mt-2 sm:mt-2">
          {isComplete
            ? 'All set — tap to generate'
            : `${answeredCount}/${totalSections} complete — fill every section above`}
        </p>
      </div>
    </form>
  );
}
