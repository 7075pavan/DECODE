export interface LeitnerItem {
  id: string;
  conceptTitle: string;
  cueText: string;
  explanation: string;
  strength: "Weak" | "Medium" | "Strong";
  pathId: string;
  unitId: string;
  box: 1 | 2 | 3 | 4;
  intervalDays: number;
  addedAt: string; // ISO date
  lastReviewedAt: string | null;
  nextReviewDate: string; // YYYY-MM-DD
  history: {
    date: string;
    remembered: boolean;
  }[];
}

export const LEITNER_INTERVALS: Record<1 | 2 | 3 | 4, number> = {
  1: 1,  // Box 1: returns in 1 day
  2: 3,  // Box 2: returns in 3 days
  3: 7,  // Box 3: returns in 7 days
  4: 14, // Box 4: Mastered, returns in 14 days
};

export function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function createLeitnerItem(params: {
  id: string;
  conceptTitle: string;
  cueText: string;
  explanation: string;
  strength?: "Weak" | "Medium" | "Strong";
  pathId?: string;
  unitId?: string;
  baseDate?: string;
}): LeitnerItem {
  const base = params.baseDate || formatDate(new Date());
  return {
    id: params.id,
    conceptTitle: params.conceptTitle,
    cueText: params.cueText,
    explanation: params.explanation,
    strength: params.strength || "Medium",
    pathId: params.pathId || "reading-people",
    unitId: params.unitId || "reading-people-unit-1",
    box: 1,
    intervalDays: LEITNER_INTERVALS[1],
    addedAt: base,
    lastReviewedAt: null,
    nextReviewDate: addDays(base, LEITNER_INTERVALS[1]), // 1 day
    history: [],
  };
}

export function processReviewAttempt(
  item: LeitnerItem,
  remembered: boolean,
  currentDate?: string
): LeitnerItem {
  const today = currentDate || formatDate(new Date());
  let newBox: 1 | 2 | 3 | 4 = item.box;

  if (remembered) {
    // Advance box: 1 -> 2 (3d), 2 -> 3 (7d), 3 -> 4 (14d)
    if (newBox < 4) {
      newBox = (newBox + 1) as 1 | 2 | 3 | 4;
    }
  } else {
    // Drop back to Box 1 (1d) on any miss
    newBox = 1;
  }

  const interval = LEITNER_INTERVALS[newBox];
  const nextDate = addDays(today, interval);

  return {
    ...item,
    box: newBox,
    intervalDays: interval,
    lastReviewedAt: today,
    nextReviewDate: nextDate,
    history: [
      ...item.history,
      { date: today, remembered },
    ],
  };
}

export function isItemDue(item: LeitnerItem, currentDate?: string): boolean {
  const today = currentDate || formatDate(new Date());
  return item.nextReviewDate <= today;
}

export function getDueItems(items: LeitnerItem[], currentDate?: string): LeitnerItem[] {
  const today = currentDate || formatDate(new Date());
  return items.filter((item) => isItemDue(item, today));
}
