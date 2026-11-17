import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserProfile, Rank } from "@/types";
import { getRankInfo } from "@/lib/scoring/scoringEngine";
import {
  loginAsGuest,
  loginWithGoogle,
  linkGuestWithGoogle,
  handleRedirectResult,
  logout as firebaseLogout,
} from "@/lib/firebase/auth";

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
  signInGoogle: () => Promise<"REDIRECT_STARTED" | void>;
  linkToGoogle: () => Promise<"REDIRECT_STARTED" | void>;
  handleRedirectAuth: () => Promise<UserProfile | null>;
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
            user: profile,
            isLoading: false,
          });
        } catch (error) {
          console.error("[useAuthStore] Guest login failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signInGoogle: async () => {
        set({ isLoading: true });
        try {
          const currentGuest = get().user?.isAnonymous ? get().user : null;
          const result = await loginWithGoogle(currentGuest);
          if (result.redirectStarted) {
            return "REDIRECT_STARTED";
          }
          if (result.profile) {
            set({
              user: result.profile,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("[useAuthStore] Google login failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      linkToGoogle: async () => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({ isLoading: true });
        try {
          const result = await linkGuestWithGoogle(currentUser);
          if (result.redirectStarted) {
            return "REDIRECT_STARTED";
          }
          if (result.profile) {
            set({
              user: result.profile,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("[useAuthStore] Account linking failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      handleRedirectAuth: async () => {
        const currentGuest = get().user?.isAnonymous ? get().user : null;
        try {
          const profile = await handleRedirectResult(currentGuest);
          if (profile) {
            set({
              user: profile,
              isLoading: false,
            });
            return profile;
          }
          return null;
        } catch (error) {
          console.error("[useAuthStore] handleRedirectAuth failed:", error);
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
