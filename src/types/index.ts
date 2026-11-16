import { Rank } from "@/lib/scoring/scoringEngine";
import { LeitnerItem } from "@/lib/srs/leitnerEngine";

export type PathId =
  | "reading-people"
  | "detective-mind"
  | "mind-and-mindset"
  | "influence-negotiation"
  | "money-wealth";

export interface UserProfile {
  uid: string;
  isAnonymous: boolean;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  lastActiveAt: string;
  totalXP: number;
  currentRank: Rank;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
    freezeTokens: number;
  };
  dailyGoalMinutes: 5 | 10 | 15;
  dailyMinutesToday: number;
  activePathId: PathId;
  activeLessonId: string;
  completedUnits: string[];
  unlockedUnits: string[];
  earnedBadges: {
    id: string;
    title: string;
    unitId: string;
    awardedAt: string;
    icon: string;
  }[];
}

export interface PathSummary {
  id: PathId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  completedLessons: number;
  totalLessons: number;
  isLocked?: boolean;
  unlockRequirement?: string;
  isRecommended?: boolean;
}

export interface LessonSummary {
  id: string;
  pathId: PathId;
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  unitTitle: string;
}

export type { Rank, LeitnerItem };
