import readingPeople1 from "./units/reading-people-unit-1.json";
import readingPeople2 from "./units/reading-people-unit-2.json";
import readingPeople3 from "./units/reading-people-unit-3.json";

import detectiveMind1 from "./units/detective-mind-unit-1.json";
import detectiveMind2 from "./units/detective-mind-unit-2.json";
import detectiveMind3 from "./units/detective-mind-unit-3.json";

import mindAndMindset1 from "./units/mind-and-mindset-unit-1.json";
import mindAndMindset2 from "./units/mind-and-mindset-unit-2.json";
import mindAndMindset3 from "./units/mind-and-mindset-unit-3.json";

import influenceNegotiation1 from "./units/influence-negotiation-unit-1.json";
import influenceNegotiation2 from "./units/influence-negotiation-unit-2.json";
import influenceNegotiation3 from "./units/influence-negotiation-unit-3.json";

import moneyWealth1 from "./units/money-wealth-unit-1.json";
import moneyWealth2 from "./units/money-wealth-unit-2.json";
import moneyWealth3 from "./units/money-wealth-unit-3.json";

export const UNITS_REGISTRY: Record<string, any> = {
  "reading-people-unit-1": readingPeople1,
  "reading-people-unit-2": readingPeople2,
  "reading-people-unit-3": readingPeople3,

  "detective-mind-unit-1": detectiveMind1,
  "detective-mind-unit-2": detectiveMind2,
  "detective-mind-unit-3": detectiveMind3,

  "mind-and-mindset-unit-1": mindAndMindset1,
  "mind-and-mindset-unit-2": mindAndMindset2,
  "mind-and-mindset-unit-3": mindAndMindset3,

  "influence-negotiation-unit-1": influenceNegotiation1,
  "influence-negotiation-unit-2": influenceNegotiation2,
  "influence-negotiation-unit-3": influenceNegotiation3,

  "money-wealth-unit-1": moneyWealth1,
  "money-wealth-unit-2": moneyWealth2,
  "money-wealth-unit-3": moneyWealth3,
};

export function getUnitData(unitId: string): any {
  return UNITS_REGISTRY[unitId] || readingPeople1;
}

export function getAllUnitsForPath(pathId: string): any[] {
  return Object.values(UNITS_REGISTRY).filter((u: any) => u.pathId === pathId);
}
