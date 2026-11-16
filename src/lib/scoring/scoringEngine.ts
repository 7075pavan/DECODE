export type Rank = "Rookie" | "Observer" | "Analyst" | "Profiler" | "Master Reader";

export interface RankInfo {
  currentRank: Rank;
  nextRank: Rank | null;
  minXP: number;
  nextRankXP: number | null;
  progressPercent: number;
}

export const RANKS: { rank: Rank; minXP: number }[] = [
  { rank: "Rookie", minXP: 0 },
  { rank: "Observer", minXP: 250 },
  { rank: "Analyst", minXP: 750 },
  { rank: "Profiler", minXP: 1500 },
  { rank: "Master Reader", minXP: 3000 },
];

/**
 * Calculates XP for a single step (e.g. emotion, intent, move).
 * Each correct step = 10 XP base.
 * Calibration bonus or penalty based on confidence c in [0.5, 1.0]:
 * - Correct adds round(10 * (c - 0.5))
 * - Wrong subtracts round(10 * (c - 0.5))
 */
export function calculateStepXP(isCorrect: boolean, confidence: number): {
  baseXP: number;
  calibrationDelta: number;
  stepXP: number;
} {
  const clampedC = Math.max(0.5, Math.min(1.0, confidence > 1 ? confidence / 100 : confidence));
  const rawDelta = Math.round(10 * (clampedC - 0.5));
  const delta = rawDelta === 0 ? 0 : rawDelta;

  if (isCorrect) {
    return {
      baseXP: 10,
      calibrationDelta: delta,
      stepXP: 10 + delta,
    };
  } else {
    return {
      baseXP: 0,
      calibrationDelta: delta === 0 ? 0 : -delta,
      stepXP: delta === 0 ? 0 : -delta,
    };
  }
}

/**
 * Calculates net XP for an entire question (e.g. 3 steps: emotion, intent, move).
 * Rule: a question's net XP never goes below 0.
 */
export function calculateQuestionNetXP(
  steps: { isCorrect: boolean; confidence: number }[]
): {
  grossXP: number;
  netXP: number;
  stepBreakdown: { isCorrect: boolean; confidence: number; stepXP: number }[];
} {
  const stepBreakdown = steps.map((s) => {
    const res = calculateStepXP(s.isCorrect, s.confidence);
    return {
      isCorrect: s.isCorrect,
      confidence: s.confidence,
      stepXP: res.stepXP,
    };
  });

  const grossXP = stepBreakdown.reduce((sum, s) => sum + s.stepXP, 0);
  const netXP = Math.max(0, grossXP);

  return {
    grossXP,
    netXP,
    stepBreakdown,
  };
}

/**
 * Calculates the Brier score: BS = (1/N) * sum( (c_i - o_i)^2 )
 * where o_i = 1 for correct, 0 for wrong, and c_i in [0.5, 1.0].
 * Perfect calibration = 0.00.
 */
export function calculateBrierScore(
  predictions: { confidence: number; isCorrect: boolean }[]
): {
  brierScore: number;
  accuracy: number;
  avgConfidence: number;
  calibrationMatchPercent: number;
  calibrationVerdict: string;
} {
  if (predictions.length === 0) {
    return {
      brierScore: 0,
      accuracy: 0,
      avgConfidence: 0,
      calibrationMatchPercent: 100,
      calibrationVerdict: "No data",
    };
  }

  let sumSquaredDiff = 0;
  let correctCount = 0;
  let sumConfidence = 0;

  for (const p of predictions) {
    const c = Math.max(0.5, Math.min(1.0, p.confidence > 1 ? p.confidence / 100 : p.confidence));
    const o = p.isCorrect ? 1 : 0;
    sumSquaredDiff += Math.pow(c - o, 2);
    sumConfidence += c;
    if (p.isCorrect) correctCount++;
  }

  const n = predictions.length;
  const brierScore = Number((sumSquaredDiff / n).toFixed(4));
  const accuracy = Math.round((correctCount / n) * 100);
  const avgConfidence = Math.round((sumConfidence / n) * 100);

  // Calibration gap: difference between average subjective certainty and true accuracy
  const calibrationGap = Math.abs(avgConfidence - accuracy);
  const calibrationMatchPercent = Math.max(0, 100 - calibrationGap);

  let calibrationVerdict = "Master Calibration";
  if (brierScore > 0.28) {
    calibrationVerdict = "Overconfident / Mixed";
  } else if (brierScore > 0.18) {
    calibrationVerdict = "Developing Accuracy";
  } else if (brierScore > 0.10) {
    calibrationVerdict = "Well Calibrated";
  }

  return {
    brierScore,
    accuracy,
    avgConfidence,
    calibrationMatchPercent,
    calibrationVerdict,
  };
}

/**
 * Returns rank information based on total XP
 */
export function getRankInfo(totalXP: number): RankInfo {
  let currentRank: Rank = "Rookie";
  let nextRank: Rank | null = "Observer";
  let minXP = 0;
  let nextRankXP: number | null = 250;

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].minXP) {
      currentRank = RANKS[i].rank;
      minXP = RANKS[i].minXP;
      if (i < RANKS.length - 1) {
        nextRank = RANKS[i + 1].rank;
        nextRankXP = RANKS[i + 1].minXP;
      } else {
        nextRank = null;
        nextRankXP = null;
      }
      break;
    }
  }

  let progressPercent = 100;
  if (nextRankXP !== null) {
    const range = nextRankXP - minXP;
    const earned = totalXP - minXP;
    progressPercent = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
  }

  return {
    currentRank,
    nextRank,
    minXP,
    nextRankXP,
    progressPercent,
  };
}
