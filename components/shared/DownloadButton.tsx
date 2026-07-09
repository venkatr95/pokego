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
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const generateWallpaper = async (cardDataUrl: string, type: 'mobile' | 'desktop'): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(cardDataUrl);

        if (type === 'mobile') {
          canvas.width = 1080;
          canvas.height = 1920;
        } else {
          canvas.width = 1920;
          canvas.height = 1080;
        }

        // Draw radial gradient background
        const typeTheme = card.matchedPokemon.primaryType;
        const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 3, 0, canvas.width / 2, canvas.height / 2, canvas.height);
        gradient.addColorStop(0, '#1a1b26'); // Darker center
        gradient.addColorStop(1, '#0a0b0f'); // Very dark edges
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate scale to fit card nicely
        const scale = type === 'mobile' ? (canvas.width * 0.8) / img.width : (canvas.height * 0.7) / img.height;
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        // Draw card shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;

        ctx.drawImage(img, x, y, w, h);
        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.src = cardDataUrl;
    });
  };

  const download = async (format: typeof FORMATS[number]) => {
    const element = document.getElementById(cardElementId);
    if (!element) return;

    setDownloading(format.id);
    try {
      let dataUrl = await format.fn(element, {
        quality: 0.98,
        pixelRatio: isTouchDevice ? 1.5 : 3, // Prevent mobile safari memory crashes
        cacheBust: true,
        backgroundColor: 'transparent',
        style: {
          transform: 'none',
          perspective: 'none',
          boxShadow: 'none',
        }
      });

      if (format.id === 'wallpaper-mobile') {
        dataUrl = await generateWallpaper(dataUrl, 'mobile');
      } else if (format.id === 'wallpaper-desktop') {
        dataUrl = await generateWallpaper(dataUrl, 'desktop');
      }

      const fileName = `pokeyou-${card.trainerName.toLowerCase().replace(/\s+/g, '-')}-${card.matchedPokemon.name}-${format.id}.${format.ext}`;

      if (isTouchDevice) {
        setResultImage(dataUrl);
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      console.error('Download failed:', e);
      alert('Failed to generate image. Please try again. Error: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setDownloading(null);
      if (!isTouchDevice) setOpen(false);
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
      <AnimatePresence>
        {resultImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
            onClick={() => setResultImage(null)}
          >
            <div className="relative flex flex-col items-center w-full max-w-sm gap-6" onClick={e => e.stopPropagation()}>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Your Card is Ready!</h3>
                <p className="text-white/80 text-sm bg-white/10 px-4 py-2 rounded-full border border-white/20">
                  👆 Long-press the image to save
                </p>
              </div>
              
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={resultImage} 
                alt="Your Custom Card" 
                className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-2xl shadow-brand-500/20" 
              />
              
              <button 
                className="btn-primary w-full py-3" 
                onClick={() => {
                  setResultImage(null);
                  setOpen(false);
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
