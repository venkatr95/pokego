import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DailyReward {
  day: number;
  type: 'xp' | 'theme' | 'mystery_pokemon';
  amount?: number;
  themeId?: string;
  claimed: boolean;
}

interface DailyState {
  streak: number;
  lastClaimDate: string | null;
  rewards: DailyReward[];
  claimReward: () => void;
}

const INITIAL_REWARDS: DailyReward[] = [
  { day: 1, type: 'xp', amount: 50, claimed: false },
  { day: 2, type: 'xp', amount: 100, claimed: false },
  { day: 3, type: 'theme', themeId: 'gold-secret', claimed: false },
  { day: 4, type: 'xp', amount: 200, claimed: false },
  { day: 5, type: 'mystery_pokemon', claimed: false },
];

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastClaimDate: null,
      rewards: INITIAL_REWARDS,

      claimReward: () => {
        const today = new Date().toDateString();
        const { lastClaimDate, streak, rewards } = get();

        if (lastClaimDate === today) return; // Already claimed today

        // Check if streak is broken (more than 48 hours since last claim)
        let newStreak = streak;
        if (lastClaimDate) {
          const lastDate = new Date(lastClaimDate);
          const diffHours = Math.abs(new Date().getTime() - lastDate.getTime()) / 36e5;
          if (diffHours > 48) {
            newStreak = 0; // Streak broken
          }
        }

        const targetDay = (newStreak % 5) + 1; // 5-day rotating rewards
        
        const updatedRewards = rewards.map((r) => {
          if (r.day === targetDay) return { ...r, claimed: true };
          if (newStreak === 0) return { ...r, claimed: false }; // Reset visual on broken streak
          return r;
        });

        set({
          streak: newStreak + 1,
          lastClaimDate: today,
          rewards: updatedRewards,
        });
      }
    }),
    {
      name: 'pokeyou-daily',
    }
  )
);
