import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: 'quiz_complete' | 'first_share' | 'generate_5' | 'daily_login' | 'team_built';
  progress: number;
  maxProgress: number;
  unlockedAt: string | null;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: 'A New Journey', description: 'Complete the personality quiz for the first time.', icon: '🎒', xpReward: 50, condition: 'quiz_complete', progress: 0, maxProgress: 1, unlockedAt: null },
  { id: 'social_butterfly', title: 'Social Butterfly', description: 'Share your card with friends.', icon: '🦋', xpReward: 100, condition: 'first_share', progress: 0, maxProgress: 1, unlockedAt: null },
  { id: 'collector', title: 'Avid Collector', description: 'Generate 5 different Pokémon cards.', icon: '🗃️', xpReward: 250, condition: 'generate_5', progress: 0, maxProgress: 5, unlockedAt: null },
  { id: 'dedicated', title: 'Dedicated Trainer', description: 'Log in and claim a daily reward.', icon: '📅', xpReward: 100, condition: 'daily_login', progress: 0, maxProgress: 1, unlockedAt: null },
  { id: 'tactician', title: 'Master Tactician', description: 'View your AI-generated recommended team.', icon: '🧩', xpReward: 150, condition: 'team_built', progress: 0, maxProgress: 1, unlockedAt: null },
];

interface AchievementsState {
  achievements: Achievement[];
  totalXP: number;
  lastLoginDate: string | null;
  cardsGenerated: number;
  addXP: (amount: number) => void;
  updateProgress: (condition: Achievement['condition'], amount?: number) => void;
  recordLogin: () => void;
  incrementCardsGenerated: () => void;
  syncWithCloud: (userId: string) => Promise<void>;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: ACHIEVEMENTS,
      totalXP: 0,
      lastLoginDate: null,
      cardsGenerated: 0,

      addXP: (amount) => set((state) => ({ totalXP: state.totalXP + amount })),

      updateProgress: (condition, amount = 1) => {
        set((state) => {
          let xpEarned = 0;
          const updated = state.achievements.map((ach) => {
            if (ach.condition === condition && !ach.unlockedAt) {
              const newProgress = Math.min(ach.progress + amount, ach.maxProgress);
              if (newProgress >= ach.maxProgress) {
                xpEarned += ach.xpReward;
                return { ...ach, progress: newProgress, unlockedAt: new Date().toISOString() };
              }
              return { ...ach, progress: newProgress };
            }
            return ach;
          });
          return {
            achievements: updated,
            totalXP: state.totalXP + xpEarned,
          };
        });
      },

      recordLogin: () => {
        const today = new Date().toDateString();
        const { lastLoginDate, updateProgress } = get();
        if (lastLoginDate !== today) {
          set({ lastLoginDate: today });
          updateProgress('daily_login');
        }
      },

      incrementCardsGenerated: () => {
        set((state) => ({ cardsGenerated: state.cardsGenerated + 1 }));
        get().updateProgress('generate_5');
      },

      syncWithCloud: async (userId: string) => {
        try {
          const { createClient } = await import('@/lib/supabase/client');
          const supabase = createClient();
          const { totalXP } = get();
          
          if (totalXP > 0) {
            // Push local XP to cloud if we have some
            await supabase.from('users').update({ xp: totalXP }).eq('id', userId);
          }
        } catch (err) {
          console.error('Failed to sync with cloud:', err);
        }
      },
    }),
    {
      name: 'pokeyou-achievements',
    }
  )
);
