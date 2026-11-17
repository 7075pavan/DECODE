import { describe, it, expect } from "vitest";
import { UNITS_REGISTRY, getUnitData, getAllUnitsForPath } from "../src/content/registry";
import { PATHS_DATA } from "../src/content/paths";

describe("Milestone 5: 5 Paths & 15 Complete Units", () => {
  it("should have all 5 paths configured in PATHS_DATA with 5 units each", () => {
    expect(PATHS_DATA).toHaveLength(5);
    const pathIds = PATHS_DATA.map((p) => p.id);
    expect(pathIds).toEqual([
      "reading-people",
      "detective-mind",
      "mind-and-mindset",
      "influence-negotiation",
      "money-wealth",
    ]);

    PATHS_DATA.forEach((path) => {
      expect(path.units).toHaveLength(5);
      // First 3 units must be marked playable
      expect(path.units[0].isPlayable).toBe(true);
      expect(path.units[1].isPlayable).toBe(true);
      expect(path.units[2].isPlayable).toBe(true);
      // Unit 3 should feature the Mastery Shield
      expect(path.units[2].isMasteryShield).toBe(true);
    });
  });

  it("should have exactly 15 complete playable units registered", () => {
    const keys = Object.keys(UNITS_REGISTRY);
    expect(keys).toHaveLength(15);
  });

  const expectedUnits = [
    "reading-people-unit-1",
    "reading-people-unit-2",
    "reading-people-unit-3",
    "detective-mind-unit-1",
    "detective-mind-unit-2",
    "detective-mind-unit-3",
    "mind-and-mindset-unit-1",
    "mind-and-mindset-unit-2",
    "mind-and-mindset-unit-3",
    "influence-negotiation-unit-1",
    "influence-negotiation-unit-2",
    "influence-negotiation-unit-3",
    "money-wealth-unit-1",
    "money-wealth-unit-2",
    "money-wealth-unit-3",
  ];

  expectedUnits.forEach((unitId) => {
    it(`should have valid 6-step loop schema for ${unitId}`, () => {
      const data = getUnitData(unitId);
      expect(data).toBeDefined();
      expect(data.unitId).toBe(unitId);
      expect(data.title).toBeTruthy();
      expect(data.rulesSummary).toHaveLength(5);

      // Learn Step: 5 cards, exactly 1 key rule
      expect(data.learn.cards).toHaveLength(5);
      const keyRules = data.learn.cards.filter((c: any) => c.isKeyRule);
      expect(keyRules).toHaveLength(1);

      // See Step: scenario and at least 3 clues
      expect(data.see.story.length).toBeGreaterThanOrEqual(2);
      expect(data.see.clues.length).toBeGreaterThanOrEqual(3);

      // Try Step: at least 3 cases, each with 3 sub-steps (emotion, intent, move)
      const cases = data.try.cases || data.try.scenarios;
      expect(cases.length).toBeGreaterThanOrEqual(3);
      cases.slice(0, 3).forEach((c: any) => {
        const steps = c.steps || c.subSteps;
        expect(steps).toHaveLength(3);
        expect(steps[0].options.length).toBeGreaterThanOrEqual(3);
        expect(steps[1].options.length).toBeGreaterThanOrEqual(3);
        expect(steps[2].options.length).toBeGreaterThanOrEqual(3);
      });

      // Prove Step: 8 questions, 80% passing
      expect(data.prove.questions).toHaveLength(8);
      expect(data.prove.passingPercentage || data.prove.passingScorePercent).toBe(80);

      // Apply Step: real mission
      const prompt = data.apply.briefing || data.apply.missionPrompt;
      const steps = data.apply.actionSteps || data.apply.instructions;
      const reflection = data.apply.reflectionPrompt || data.apply.reflectionQuestion;

      expect(prompt).toBeTruthy();
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(reflection).toBeTruthy();
    });
  });

  it("should thoroughly cover all required Money & Wealth concepts across its 3 units", () => {
    const mwUnits = [
      getUnitData("money-wealth-unit-1"),
      getUnitData("money-wealth-unit-2"),
      getUnitData("money-wealth-unit-3"),
    ];

    const allText = JSON.stringify(mwUnits).toLowerCase();

    const requiredConcepts = [
      "spend less than you earn",
      "pay yourself first",
      "lifestyle creep",
      "loss aversion",
      "scarcity",
      "delayed gratification",
      "assets vs liabilities",
      "compounding",
      "gambling",
      "debt",
      "emergency fund",
      "income skills",
      "herd effect",
      "pricing",
      "cash flow",
      "runway",
      "equity",
      "trust as wealth",
    ];

    requiredConcepts.forEach((concept) => {
      expect(allText).toContain(concept);
    });
  });
});
