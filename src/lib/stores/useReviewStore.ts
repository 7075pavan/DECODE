import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LeitnerItem, createLeitnerItem, processReviewAttempt, getDueItems } from "@/lib/srs/leitnerEngine";

const INITIAL_REVIEW_ITEMS: LeitnerItem[] = [
  createLeitnerItem({
    id: "cue-lip-press",
    conceptTitle: "Lip Compression",
    cueText: "Lips pressed firmly into a thin horizontal line",
    explanation: "Signals emotional withholding, disagreement, or suppressing an unspoken objection.",
    strength: "Medium",
    baseDate: "2026-11-15", // scheduled for yesterday -> due today
  }),
  createLeitnerItem({
    id: "cue-pitch-jump",
    conceptTitle: "Vocal Pitch Spike",
    cueText: "Voice frequency rises an octave while answering a commitment question",
    explanation: "Vocal cords involuntarily constrict under acute sympathetic stress.",
    strength: "Strong",
    baseDate: "2026-11-15", // due today
  }),
  createLeitnerItem({
    id: "cue-heel-tap",
    conceptTitle: "Kinetic Foot Leakage",
    cueText: "Rapid heel tapping against floor when pricing or deadlines appear",
    explanation: "Upper body suppresses anxiety while nervous tension escapes through extremities.",
    strength: "Medium",
    baseDate: "2026-11-15", // due today
  }),
  createLeitnerItem({
    id: "cue-gaze-drop",
    conceptTitle: "Visual Disconnect",
    cueText: "Gaze breaks downward for 4+ seconds immediately upon a direct question",
    explanation: "Reflects sudden internal cognitive load or deception masking rather than honest recall.",
    strength: "Strong",
    baseDate: "2026-11-15", // due today
  }),
];

interface ReviewState {
  items: LeitnerItem[];
  addMissedConcept: (concept: {
    id: string;
    conceptTitle: string;
    cueText: string;
    explanation: string;
    strength?: "Weak" | "Medium" | "Strong";
    pathId?: string;
    unitId?: string;
  }) => void;
  reviewItem: (id: string, remembered: boolean) => void;
  getDueItems: () => LeitnerItem[];
  getDueCount: () => number;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      items: INITIAL_REVIEW_ITEMS,

      addMissedConcept: (concept) => {
        const { items } = get();
        const existingIdx = items.findIndex((i) => i.id === concept.id);

        if (existingIdx >= 0) {
          // If already in queue, drop it back to Box 1
          const updated = [...items];
          updated[existingIdx] = processReviewAttempt(updated[existingIdx], false);
          set({ items: updated });
        } else {
          // Add new item in Box 1
          const newItem = createLeitnerItem({
            id: concept.id,
            conceptTitle: concept.conceptTitle,
            cueText: concept.cueText,
            explanation: concept.explanation,
            strength: concept.strength || "Medium",
            pathId: concept.pathId || "reading-people",
            unitId: concept.unitId || "reading-people-unit-1",
          });
          set({ items: [newItem, ...items] });
        }
      },

      reviewItem: (id, remembered) => {
        const { items } = get();
        const updated = items.map((item) => {
          if (item.id === id) {
            return processReviewAttempt(item, remembered);
          }
          return item;
        });
        set({ items: updated });
      },

      getDueItems: () => {
        const { items } = get();
        return getDueItems(items);
      },

      getDueCount: () => {
        const { items } = get();
        return getDueItems(items).length;
      },
    }),
    {
      name: "decode-review-storage",
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
