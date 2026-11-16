import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile, Rank } from "@/types";
import { getRankInfo } from "@/lib/scoring/scoringEngine";
import { loginAsGuest, loginWithGoogle, linkGuestWithGoogle, logout as firebaseLogout } from "@/lib/firebase/auth";

interface LevelUpEvent {
  oldRank: Rank;
  newRank: Rank;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isOnboarded: boolean;
  levelUpEvent: LevelUpEvent | null;

  signInGuest: () => Promise<void>;
  signInGoogle: () => Promise<void>;
  linkToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setDailyGoal: (minutes: 5 | 10 | 15) => void;
  completeOnboarding: () => void;
  addXP: (amount: number) => { newTotalXP: number; didLevelUp: boolean; newRank: Rank };
  clearLevelUpEvent: () => void;
  useStreakFreeze: () => boolean;
  logDailyMinutes: (minutes: number) => void;
  unlockUnitAndAwardBadge: (unitId: string, nextUnitId: string, badge: { id: string; title: string; icon: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isOnboarded: false,
      levelUpEvent: null,

      signInGuest: async () => {
        set({ isLoading: true });
        try {
          const profile = await loginAsGuest();
          set({
            user: {
              ...profile,
              currentRank: "Rookie",
              streak: {
                current: 1,
                longest: 1,
                lastActiveDate: new Date().toISOString().split("T")[0],
                freezeTokens: 1,
              },
              dailyMinutesToday: 0,
              completedUnits: [],
              unlockedUnits: ["reading-people-unit-1"],
              earnedBadges: [],
            },
            isLoading: false,
          });
        } catch (error) {
          console.error("Guest login failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signInGoogle: async () => {
        set({ isLoading: true });
        try {
          const profile = await loginWithGoogle();
          set({
            user: {
              ...profile,
              currentRank: getRankInfo(profile.totalXP).currentRank,
              streak: {
                current: profile.streak.current || 3,
                longest: profile.streak.longest || 3,
                lastActiveDate: new Date().toISOString().split("T")[0],
                freezeTokens: 1,
              },
              dailyMinutesToday: 3,
              completedUnits: [],
              unlockedUnits: ["reading-people-unit-1"],
              earnedBadges: [],
            },
            isLoading: false,
          });
        } catch (error) {
          console.error("Google login failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      linkToGoogle: async () => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ isLoading: true });
        try {
          const upgraded = await linkGuestWithGoogle(currentUser as any);
          set({
            user: {
              ...currentUser,
              ...upgraded,
            },
            isLoading: false,
          });
        } catch (error) {
          console.error("Account linking failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        await firebaseLogout();
        set({ user: null, isOnboarded: false });
      },

      setDailyGoal: (minutes) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, dailyGoalMinutes: minutes } });
        }
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },

      addXP: (amount) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { newTotalXP: 0, didLevelUp: false, newRank: "Rookie" };
        }

        const oldRank = currentUser.currentRank || getRankInfo(currentUser.totalXP).currentRank;
        const newTotalXP = Math.max(0, currentUser.totalXP + amount);
        const rankInfo = getRankInfo(newTotalXP);
        const didLevelUp = rankInfo.currentRank !== oldRank;

        set({
          user: {
            ...currentUser,
            totalXP: newTotalXP,
            currentRank: rankInfo.currentRank,
          },
          levelUpEvent: didLevelUp ? { oldRank, newRank: rankInfo.currentRank } : null,
        });

        return { newTotalXP, didLevelUp, newRank: rankInfo.currentRank };
      },

      clearLevelUpEvent: () => {
        set({ levelUpEvent: null });
      },

      useStreakFreeze: () => {
        const currentUser = get().user;
        if (!currentUser || currentUser.streak.freezeTokens <= 0) return false;

        set({
          user: {
            ...currentUser,
            streak: {
              ...currentUser.streak,
              freezeTokens: currentUser.streak.freezeTokens - 1,
            },
          },
        });
        return true;
      },

      logDailyMinutes: (minutes) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              dailyMinutesToday: (currentUser.dailyMinutesToday || 0) + minutes,
            },
          });
        }
      },

      unlockUnitAndAwardBadge: (unitId, nextUnitId, badge) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const completedUnits = Array.from(new Set([...(currentUser.completedUnits || []), unitId]));
        const unlockedUnits = Array.from(new Set([...(currentUser.unlockedUnits || []), unitId, nextUnitId]));
        const earnedBadges = [
          ...(currentUser.earnedBadges || []).filter((b) => b.id !== badge.id),
          {
            ...badge,
            unitId,
            awardedAt: new Date().toISOString(),
          },
        ];

        set({
          user: {
            ...currentUser,
            completedUnits,
            unlockedUnits,
            earnedBadges,
          },
        });
      },
    }),
    {
      name: "decode-auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
