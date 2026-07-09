'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { CARD_THEMES, THEME_ORDER, type CardThemeId } from './themes';
import { ENVIRONMENT_BACKGROUNDS, type EnvironmentTheme } from './themes/backgrounds';

interface ThemeSelectorProps {
  selectedTheme: CardThemeId;
  onThemeChange: (id: CardThemeId) => void;
  selectedEnvironment: EnvironmentTheme | null;
  onEnvironmentChange: (id: EnvironmentTheme | null) => void;
}

const ENVIRONMENT_ORDER = [
  'stormy-mountain', 'cherry-blossom', 'volcano', 'crystal-cave', 'cyberpunk-city',
  'aurora-sky', 'deep-ocean', 'haunted-castle', 'space-galaxy', 'ancient-temple',
] as EnvironmentTheme[];

export function ThemeSelector({
  selectedTheme,
  onThemeChange,
  selectedEnvironment,
  onEnvironmentChange,
}: ThemeSelectorProps) {
  const themeScrollRef = useRef<HTMLDivElement>(null);
  const envScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full space-y-4">
      {/* Card Style */}
      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🎨</span> Card Style
        </p>
        <div
          ref={themeScrollRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
          style={{ scrollbarWidth: 'thin' }}
        >
          {THEME_ORDER.map((id) => {
            const theme = CARD_THEMES[id];
            const isSelected = selectedTheme === id;
            return (
              <motion.button
                key={id}
                onClick={() => onThemeChange(id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
              >
                {/* Preview swatch */}
                <div
                  className="relative w-14 h-20 rounded-lg overflow-hidden transition-all duration-200"
                  style={{
                    background: theme.previewGradient,
                    border: isSelected ? '2px solid white' : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: isSelected ? '0 0 16px rgba(255,255,255,0.4), 0 0 32px rgba(255,255,255,0.2)' : 'none',
                    borderRadius: theme.borderRadius,
                  }}
                >
                  {/* Mini card lines */}
                  <div className="absolute inset-x-2 top-2 h-0.5 bg-foreground/20 rounded-full" />
                  <div className="absolute inset-x-2 top-5 h-5 bg-foreground/10 rounded" />
                  <div className="absolute inset-x-2 bottom-6 h-0.5 bg-foreground/15 rounded-full" />
                  <div className="absolute inset-x-2 bottom-4 h-0.5 bg-foreground/10 rounded-full" />
                  <div className="absolute inset-x-2 bottom-2 h-0.5 bg-foreground/10 rounded-full" />

                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId="theme-selected"
                      className="absolute inset-0 bg-foreground/10 rounded-lg"
                      initial={false}
                    />
                  )}
                  <div className="absolute top-1 right-1 text-[10px]">{theme.emoji}</div>
                </div>
                <span className={`text-[9px] font-medium transition-colors ${isSelected ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground/70'}`}>
                  {theme.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Environment / Background */}
      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span>🌍</span> Background Environment
        </p>
        <div
          ref={envScrollRef}
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Auto option */}
          <motion.button
            onClick={() => onEnvironmentChange(null)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                border: selectedEnvironment === null ? '2px solid white' : '2px solid rgba(255,255,255,0.1)',
                boxShadow: selectedEnvironment === null ? '0 0 16px rgba(255,255,255,0.3)' : 'none',
              }}
            >
              ✨
            </div>
            <span className={`text-[9px] font-medium ${selectedEnvironment === null ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground/70'}`}>
              Auto
            </span>
          </motion.button>

          {ENVIRONMENT_ORDER.map((id) => {
            const env = ENVIRONMENT_BACKGROUNDS[id];
            const isSelected = selectedEnvironment === id;
            return (
              <motion.button
                key={id}
                onClick={() => onEnvironmentChange(id)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-xl transition-all overflow-hidden relative"
                  style={{
                    background: env.gradient,
                    border: isSelected ? '2px solid white' : '2px solid rgba(255,255,255,0.1)',
                    boxShadow: isSelected ? `0 0 16px ${env.atmosphereColor}60` : 'none',
                  }}
                >
                  <span className="relative z-10">{env.emoji}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="env-selected"
                      className="absolute inset-0 bg-foreground/15"
                      initial={false}
                    />
                  )}
                </div>
                <span className={`text-[9px] font-medium max-w-[52px] text-center leading-tight ${isSelected ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground/70'}`}>
                  {env.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
