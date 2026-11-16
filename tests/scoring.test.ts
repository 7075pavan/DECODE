import { describe, it, expect } from "vitest";
import {
  calculateStepXP,
  calculateQuestionNetXP,
  calculateBrierScore,
  getRankInfo,
} from "../src/lib/scoring/scoringEngine";

describe("Scoring & Calibration Engine", () => {
  describe("calculateStepXP", () => {
    it("awards 10 XP base for correct answer at 50% confidence with 0 bonus", () => {
      const res = calculateStepXP(true, 50);
      expect(res.baseXP).toBe(10);
      expect(res.calibrationDelta).toBe(0);
      expect(res.stepXP).toBe(10);
    });

    it("awards 13 XP for correct answer at 80% confidence (10 base + 3 bonus)", () => {
      const res = calculateStepXP(true, 80);
      expect(res.baseXP).toBe(10);
      expect(res.calibrationDelta).toBe(3); // round(10 * (0.8 - 0.5)) = round(3) = 3
      expect(res.stepXP).toBe(13);
    });

    it("awards 15 XP for correct answer at 100% confidence (10 base + 5 bonus)", () => {
      const res = calculateStepXP(true, 100);
      expect(res.baseXP).toBe(10);
      expect(res.calibrationDelta).toBe(5); // round(10 * (1.0 - 0.5)) = 5
      expect(res.stepXP).toBe(15);
    });

    it("deducts 0 XP for wrong answer at 50% confidence (honest humility)", () => {
      const res = calculateStepXP(false, 50);
      expect(res.baseXP).toBe(0);
      expect(res.calibrationDelta).toBe(0);
      expect(res.stepXP).toBe(0);
    });

    it("deducts 3 XP for wrong answer at 80% confidence", () => {
      const res = calculateStepXP(false, 80);
      expect(res.calibrationDelta).toBe(-3);
      expect(res.stepXP).toBe(-3);
    });

    it("deducts 5 XP for wrong answer at 100% confidence (overconfidence penalty)", () => {
      const res = calculateStepXP(false, 100);
      expect(res.calibrationDelta).toBe(-5);
      expect(res.stepXP).toBe(-5);
    });
  });

  describe("calculateQuestionNetXP", () => {
    it("ensures a question net XP never goes below 0", () => {
      // 3 wrong answers with high confidence: -5, -4, -5 = -14 gross
      const res = calculateQuestionNetXP([
        { isCorrect: false, confidence: 100 },
        { isCorrect: false, confidence: 90 },
        { isCorrect: false, confidence: 100 },
      ]);
      expect(res.grossXP).toBeLessThan(0);
      expect(res.netXP).toBe(0); // Clamped at 0
    });

    it("correctly computes positive net XP for mixed question steps", () => {
      const res = calculateQuestionNetXP([
        { isCorrect: true, confidence: 80 },  // +13
        { isCorrect: false, confidence: 80 }, // -3
        { isCorrect: true, confidence: 100 }, // +15
      ]);
      expect(res.grossXP).toBe(25);
      expect(res.netXP).toBe(25);
    });
  });

  describe("calculateBrierScore", () => {
    it("calculates accurate Brier score and calibration percentage", () => {
      const perfectPredictions = [
        { confidence: 100, isCorrect: true },
        { confidence: 100, isCorrect: true },
      ];
      const res = calculateBrierScore(perfectPredictions);
      expect(res.brierScore).toBe(0);
      expect(res.accuracy).toBe(100);
      expect(res.calibrationMatchPercent).toBe(100);
      expect(res.calibrationVerdict).toBe("Master Calibration");
    });

    it("detects poor calibration for overconfident wrong answers", () => {
      const poorPredictions = [
        { confidence: 100, isCorrect: false },
        { confidence: 90, isCorrect: false },
      ];
      const res = calculateBrierScore(poorPredictions);
      expect(res.brierScore).toBeGreaterThan(0.5);
      expect(res.accuracy).toBe(0);
      expect(res.calibrationVerdict).toBe("Overconfident / Mixed");
    });
  });

  describe("getRankInfo", () => {
    it("assigns Rookie at 0 XP", () => {
      const rank = getRankInfo(0);
      expect(rank.currentRank).toBe("Rookie");
      expect(rank.nextRank).toBe("Observer");
      expect(rank.nextRankXP).toBe(250);
    });

    it("assigns Observer at 250 XP", () => {
      const rank = getRankInfo(250);
      expect(rank.currentRank).toBe("Observer");
      expect(rank.nextRank).toBe("Analyst");
    });

    it("assigns Analyst at 750 XP", () => {
      const rank = getRankInfo(750);
      expect(rank.currentRank).toBe("Analyst");
      expect(rank.nextRank).toBe("Profiler");
    });

    it("assigns Profiler at 1500 XP", () => {
      const rank = getRankInfo(1500);
      expect(rank.currentRank).toBe("Profiler");
      expect(rank.nextRank).toBe("Master Reader");
    });

    it("assigns Master Reader at 3000 XP and above", () => {
      const rank = getRankInfo(3500);
      expect(rank.currentRank).toBe("Master Reader");
      expect(rank.nextRank).toBeNull();
      expect(rank.progressPercent).toBe(100);
    });
  });
});
