'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Heart, X } from 'lucide-react';
import { useQuizStore } from '@/store/quiz-store';
import type { QuizQuestion } from '@/types/quiz';
import type { PokemonSearchResult } from '@/types/pokemon';
import { TYPE_COLORS } from '@/types/pokemon';

interface PokemonSearchStepProps {
  question: QuizQuestion;
  onNext: () => void;
  onBack: () => void;
}

export function PokemonSearchStep({ question, onNext, onBack }: PokemonSearchStepProps) {
  const { answers, setFavoritePokemon } = useQuizStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PokemonSearchResult[]>([]);
  const [selected, setSelected] = useState<PokemonSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore from store
  useEffect(() => {
    if (answers.favoritePokemonId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (!q.trim()) { setResults([]); setOpen(false); return; }
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
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  const handleSelect = (p: PokemonSearchResult) => {
    setSelected(p);
    setQuery('');
    setOpen(false);
    setError('');
    // Full artwork URL
    const withArt: PokemonSearchResult = {
      ...p,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
    };
    setSelected(withArt);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFavoritePokemon({ id: p.id, displayName: p.displayName } as any);
  };

  const handleClear = () => {
    setSelected(null);
    setFavoritePokemon(null);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleNext = () => {
    if (!selected) {
      setError('Please choose a Buddy Pokémon to continue');
      return;
    }
    onNext();
  };

  const typeColor = selected?.primaryType ? TYPE_COLORS[selected.primaryType] : null;

  return (
    <div className="glass-card rounded-3xl p-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">{question.question}</h2>
        <p className="text-foreground/50 text-sm">Search by name or Pokédex number</p>
      </motion.div>

      {/* Selected Pokémon display */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-6 relative"
          >
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{
                background: typeColor ? typeColor.bg : 'rgba(255,255,255,0.05)',
                borderColor: typeColor ? typeColor.primary + '60' : 'rgba(255,255,255,0.1)',
                border: '1px solid',
                boxShadow: typeColor ? `0 0 30px ${typeColor.glow}` : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.sprite ?? ''}
                alt={selected.displayName}
                className="w-20 h-20 object-contain drop-shadow-2xl"
              />
              <div className="flex-1">
                <p className="text-xs text-foreground/40 font-mono mb-1">
                  #{String(selected.id).padStart(4, '0')}
                </p>
                <p className="font-display text-xl font-bold text-foreground">{selected.displayName}</p>
                <div className="flex gap-1.5 mt-2">
                  {selected.types.map((t) => (
                    <span
                      key={t}
                      className="type-badge"
                      style={{
                        background: TYPE_COLORS[t]?.bg,
                        color: TYPE_COLORS[t]?.text,
                        border: `1px solid ${TYPE_COLORS[t]?.primary}40`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg glass hover:bg-foreground/10 transition-colors"
                aria-label="Remove selection"
              >
                <X className="w-4 h-4 text-foreground/50" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search input */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInput}
            onFocus={() => query && setOpen(true)}
            placeholder={selected ? 'Search to change...' : 'Search Pokémon by name or number...'}
            className="w-full bg-foreground/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-brand-500/50 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {open && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl overflow-hidden z-50 max-h-72 overflow-y-auto"
            >
              {results.map((p) => {
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/10 transition-colors text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.sprite ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                      alt={p.displayName}
                      className="w-10 h-10 object-contain"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.displayName}</p>
                      <div className="flex gap-1 mt-0.5">
                        {p.types.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-foreground/30 font-mono">#{String(p.id).padStart(4, '0')}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm mt-2 ml-1"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 px-5 py-3 rounded-xl glass border border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20 transition-all text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {selected ? 'Continue' : 'Skip'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
