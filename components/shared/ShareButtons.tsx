'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Mail, Check } from 'lucide-react';
import type { GeneratedCard } from '@/types/card';
import { useAchievementsStore } from '@/store/achievements-store';

interface ShareButtonsProps {
  card: GeneratedCard;
  cardUrl: string;
}

export function ShareButtons({ card, cardUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { updateProgress } = useAchievementsStore();

  const pokemonName = card.matchedPokemon.displayName;
  const trainerName = card.trainerName;
  const shareText = `I discovered my Pokémon personality! I matched with ${pokemonName}! 🎉 Check out my custom Pokémon card on PokéYou!`;

  const handleCopyLink = async () => {
    updateProgress('first_share');
    await navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    updateProgress('first_share');
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${cardUrl}`)}`;
    window.open(url, '_blank');
  };

  const handleGmail = () => {
    updateProgress('first_share');
    const subject = encodeURIComponent('My Pokémon Personality Card 🎴');
    const body = encodeURIComponent(
      `Hi!\n\nI created my personalized Pokémon card on PokéYou.\n\nI matched with ${pokemonName}! Check it out here:\n${cardUrl}\n\nTake the quiz yourself: ${typeof window !== 'undefined' ? window.location.origin : ''}/quiz\n\n— ${trainerName}`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
  };

  const handleNativeShare = async () => {
    updateProgress('first_share');
    if (!navigator.share) { handleCopyLink(); return; }
    try {
      await navigator.share({
        title: `${trainerName}'s Pokémon Card`,
        text: shareText,
        url: cardUrl,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleTwitter = () => {
    updateProgress('first_share');
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(cardUrl)}&hashtags=PokemonPersonality,PokéYou`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-foreground/40 uppercase tracking-wider">Share your card</p>
      <div className="grid grid-cols-2 gap-2">
        {/* WhatsApp */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWhatsApp}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl glass border border-white/10 hover:border-green-500/40 hover:bg-green-500/10 transition-all text-sm text-foreground/70 hover:text-foreground"
        >
          <span className="text-base">💬</span>
          WhatsApp
        </motion.button>

        {/* Twitter */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTwitter}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl glass border border-white/10 hover:border-sky-500/40 hover:bg-sky-500/10 transition-all text-sm text-foreground/70 hover:text-foreground"
        >
          <span className="text-base">🐦</span>
          Twitter/X
        </motion.button>

        {/* Gmail */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGmail}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl glass border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 transition-all text-sm text-foreground/70 hover:text-foreground"
        >
          <Mail className="w-4 h-4" />
          Gmail
        </motion.button>

        {/* Native share / Copy */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNativeShare}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl glass border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/10 transition-all text-sm text-foreground/70 hover:text-foreground"
        >
          <Share2 className="w-4 h-4" />
          Share
        </motion.button>
      </div>

      {/* Copy link */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleCopyLink}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-white/10 hover:border-white/20 transition-all text-sm text-foreground/60 hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-400">Link copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Link
          </>
        )}
      </motion.button>
    </div>
  );
}
