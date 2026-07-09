'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Image, FileImage, ChevronDown } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import type { GeneratedCard } from '@/types/card';

interface DownloadButtonProps {
  cardElementId: string;
  card: GeneratedCard;
}

const FORMATS = [
  { id: 'png',        label: 'PNG (High-Res)',   icon: Image,     ext: 'png',  fn: toPng  },
  { id: 'jpeg',       label: 'JPEG',             icon: FileImage, ext: 'jpg',  fn: toJpeg },
  { id: 'wallpaper-mobile',   label: 'Mobile Wallpaper',  icon: Image, ext: 'png', fn: toPng },
  { id: 'wallpaper-desktop',  label: 'Desktop Wallpaper', icon: Image, ext: 'png', fn: toPng },
] as const;

export function DownloadButton({ cardElementId, card }: DownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = async (format: typeof FORMATS[number]) => {
    const element = document.getElementById(cardElementId);
    if (!element) return;

    setDownloading(format.id);
    try {
      const isMobile = window.innerWidth < 768;
      const dataUrl = await format.fn(element, {
        quality: 0.98,
        pixelRatio: isMobile ? 1.5 : 3, // Prevent mobile safari memory crashes
        cacheBust: true,
        backgroundColor: 'transparent',
        style: {
          transform: 'none',
          perspective: 'none',
          boxShadow: 'none',
        }
      });

      const link = document.createElement('a');
      link.download = `pokeyou-${card.trainerName.toLowerCase().replace(/\s+/g, '-')}-${card.matchedPokemon.name}.${format.ext}`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setDownloading(null);
      setOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download Card
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 glass-strong bg-background/95 shadow-2xl rounded-2xl overflow-hidden border border-white/20"
          >
            {FORMATS.map((format) => {
              const Icon = format.icon;
              const isLoading = downloading === format.id;
              return (
                <button
                  key={format.id}
                  onClick={() => download(format)}
                  disabled={!!downloading}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foreground/10 transition-colors text-left disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-foreground/50" />
                  )}
                  <span className="text-sm text-foreground/80">{format.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
