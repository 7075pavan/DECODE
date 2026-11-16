import { describe, it, expect } from "vitest";
import {
  createLeitnerItem,
  processReviewAttempt,
  isItemDue,
  getDueItems,
} from "../src/lib/srs/leitnerEngine";

describe("Leitner Review Queue SRS Engine", () => {
  it("creates a new review item in Box 1 scheduled for 1 day later", () => {
    const item = createLeitnerItem({
      id: "cue-lip-press",
      conceptTitle: "Lip Compression",
      cueText: "Lips pressed into a thin line",
      explanation: "Signals emotional withholding or disagreement",
      strength: "Medium",
      baseDate: "2026-11-16",
    });

    expect(item.box).toBe(1);
    expect(item.intervalDays).toBe(1);
    expect(item.nextReviewDate).toBe("2026-11-17");
  });

  it("advances from Box 1 to Box 2 (+3 days) when remembered", () => {
    const item = createLeitnerItem({
      id: "cue-pitch-jump",
      conceptTitle: "Vocal Pitch Spike",
      cueText: "Voice rose an octave",
      explanation: "Vocal cords constrict under sudden psychological threat",
      baseDate: "2026-11-16",
    });

    // Review on 2026-11-17
    const reviewed = processReviewAttempt(item, true, "2026-11-17");
    expect(reviewed.box).toBe(2);
    expect(reviewed.intervalDays).toBe(3);
    expect(reviewed.nextReviewDate).toBe("2026-11-20");
  });

  it("advances from Box 2 to Box 3 (+7 days) when remembered", () => {
    const item = createLeitnerItem({
      id: "cue-pitch-jump",
      conceptTitle: "Vocal Pitch Spike",
      cueText: "Voice rose an octave",
      explanation: "Vocal cords constrict under sudden psychological threat",
      baseDate: "2026-11-16",
    });

    // Box 1 -> Box 2
    const step1 = processReviewAttempt(item, true, "2026-11-17");
    // Box 2 -> Box 3
    const step2 = processReviewAttempt(step1, true, "2026-11-20");

    expect(step2.box).toBe(3);
    expect(step2.intervalDays).toBe(7);
    expect(step2.nextReviewDate).toBe("2026-11-27");
  });

  it("resets back to Box 1 (+1 day) on any failed recall", () => {
    const item = createLeitnerItem({
      id: "cue-heel-tap",
      conceptTitle: "Heel Tapping",
      cueText: "Rapid heel tapping under table",
      explanation: "Kinetic sympathetic arousal release",
      baseDate: "2026-11-16",
    });

    // Advanced to Box 3
    const b2 = processReviewAttempt(item, true, "2026-11-17");
    const b3 = processReviewAttempt(b2, true, "2026-11-20");
    expect(b3.box).toBe(3);

    // Missed on 2026-11-27
    const failed = processReviewAttempt(b3, false, "2026-11-27");
    expect(failed.box).toBe(1);
    expect(failed.intervalDays).toBe(1);
    expect(failed.nextReviewDate).toBe("2026-11-28");
  });

  it("identifies due items accurately", () => {
    const item1 = createLeitnerItem({
      id: "i1",
      conceptTitle: "C1",
      cueText: "T1",
      explanation: "E1",
      baseDate: "2026-11-15", // Next review: 2026-11-16
    });
    const item2 = createLeitnerItem({
      id: "i2",
      conceptTitle: "C2",
      cueText: "T2",
      explanation: "E2",
      baseDate: "2026-11-16", // Next review: 2026-11-17
    });

    expect(isItemDue(item1, "2026-11-16")).toBe(true);
    expect(isItemDue(item2, "2026-11-16")).toBe(false);

    const dueList = getDueItems([item1, item2], "2026-11-16");
    expect(dueList.length).toBe(1);
    expect(dueList[0].id).toBe("i1");
  });
});
