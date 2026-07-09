'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/store/quiz-store';
import CardRevealPage from '@/app/card/page';

export default function SharedCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { generatedCard, setGeneratedCard } = useQuizStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadCard() {
      // If it's already in the store, we don't need to fetch
      if (generatedCard?.id === id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/cards/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setGeneratedCard(data.card);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadCard();
  }, [id, generatedCard?.id, setGeneratedCard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        Loading your card...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center px-6 pt-20">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎴</div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Card Not Found
          </h1>
          <p className="text-foreground/60 mb-6">
            We couldn&apos;t find this card. It might have expired or doesn&apos;t exist.
          </p>
          <Link href="/quiz" className="btn-primary inline-flex items-center gap-2">
            ⚡ Start Your Quiz
          </Link>
        </div>
      </div>
    );
  }

  return <CardRevealPage />;
}
