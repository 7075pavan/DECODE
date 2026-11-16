"use client";

import React, { useState } from "react";
import { useReviewStore } from "@/lib/stores/useReviewStore";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

export default function ReviewPage() {
  const { items, reviewItem, getDueItems } = useReviewStore();
  const dueItems = getDueItems();

  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Group items by Leitner Box
  const box1 = items.filter((i) => i.box === 1);
  const box2 = items.filter((i) => i.box === 2);
  const box3 = items.filter((i) => i.box === 3);
  const box4 = items.filter((i) => i.box === 4);

  const currentItem = dueItems[activeSessionIndex];

  const handleReviewAction = (remembered: boolean) => {
    if (!currentItem) return;

    reviewItem(currentItem.id, remembered);
    setIsFlipped(false);

    if (activeSessionIndex < dueItems.length - 1) {
      setActiveSessionIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const strengthColorMap: Record<string, "default" | "cyan" | "coral"> = {
    Weak: "default",
    Medium: "cyan",
    Strong: "coral",
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9]">
          Leitner review queue
        </h1>
        <p className="text-[15px] text-[#94A3B8]">
          Spaced repetition: missed concepts return after 1, 3, then 7 days.
        </p>
      </div>

      {/* Leitner Box Status Grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-3 rounded-xl bg-[#121826] border border-[#263047] flex flex-col items-center">
          <span className="text-[18px] font-bold font-mono text-[#F87171]">
            {box1.length}
          </span>
          <span className="text-[12px] font-mono text-[#94A3B8] mt-0.5">
            Box 1 (1d)
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#121826] border border-[#263047] flex flex-col items-center">
          <span className="text-[18px] font-bold font-mono text-[#F59E0B]">
            {box2.length}
          </span>
          <span className="text-[12px] font-mono text-[#94A3B8] mt-0.5">
            Box 2 (3d)
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#121826] border border-[#263047] flex flex-col items-center">
          <span className="text-[18px] font-bold font-mono text-[#22D3EE]">
            {box3.length}
          </span>
          <span className="text-[12px] font-mono text-[#94A3B8] mt-0.5">
            Box 3 (7d)
          </span>
        </div>
        <div className="p-3 rounded-xl bg-[#121826] border border-[#263047] flex flex-col items-center">
          <span className="text-[18px] font-bold font-mono text-[#34D399]">
            {box4.length}
          </span>
          <span className="text-[12px] font-mono text-[#94A3B8] mt-0.5">
            Mastered
          </span>
        </div>
      </div>

      {/* ACTIVE REVIEW SESSION */}
      {dueItems.length > 0 && !sessionCompleted && currentItem ? (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Progress counter */}
          <div className="flex items-center justify-between text-[13px] font-mono text-[#94A3B8]">
            <span>
              Reviewing #{activeSessionIndex + 1} of {dueItems.length}
            </span>
            <Chip variant={strengthColorMap[currentItem.strength]} size="sm">
              Box {currentItem.box} ({currentItem.intervalDays}d cycle)
            </Chip>
          </div>

          {/* Flashcard with Flip State */}
          <Card
            onClick={() => setIsFlipped(!isFlipped)}
            className={`p-6 min-h-[260px] flex flex-col justify-between cursor-pointer border transition-all duration-300 relative select-none ${
              isFlipped
                ? "bg-[#1A2233] border-[#22D3EE] shadow-[0_0_20px_-4px_rgba(34,211,238,0.2)]"
                : "bg-[#121826] border-[#263047] hover:border-[#22D3EE]/40"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-mono text-[#22D3EE] uppercase tracking-wider font-semibold">
                  {currentItem.conceptTitle}
                </span>
                <span className="text-[12px] font-mono text-[#94A3B8]">
                  Tap card to {isFlipped ? "hide" : "reveal"} answer
                </span>
              </div>

              {/* Front: Cue Text */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[13px] font-mono text-[#94A3B8] uppercase">
                  Behavioral Signal / Trigger
                </span>
                <p className="text-[18px] md:text-[20px] font-semibold text-[#F1F5F9] leading-snug">
                  &ldquo;{currentItem.cueText}&rdquo;
                </p>
              </div>
            </div>

            {/* Back (Revealed): Forensic Explanation */}
            {isFlipped ? (
              <div className="mt-4 pt-4 border-t border-[#263047] animate-fadeIn">
                <span className="text-[13px] font-mono text-[#34D399] uppercase font-bold">
                  Decrypted Psychological Law
                </span>
                <p className="text-[15px] text-[#dfe2f2] leading-relaxed mt-1">
                  {currentItem.explanation}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 text-[14px] text-[#94A3B8] gap-1.5">
                <span className="material-symbols-outlined text-[18px]">touch_app</span>
                <span>Tap to reveal deduction</span>
              </div>
            )}
          </Card>

          {/* Recall Actions (Revealed when card is flipped or directly available) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => handleReviewAction(false)}
              className="border-[#F87171]/40 text-[#F87171] hover:bg-[#F87171]/10 gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
              <span>Needs practice (1d)</span>
            </Button>

            <Button
              variant="primary"
              onClick={() => handleReviewAction(true)}
              className="gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Remembered ({currentItem.box === 1 ? "3d" : currentItem.box === 2 ? "7d" : "14d"})</span>
            </Button>
          </div>
        </div>
      ) : (
        /* ALL DUE REVIEWS COMPLETED */
        <Card className="p-8 text-center flex flex-col items-center gap-4 bg-[#121826] border-[#263047]">
          <div className="w-16 h-16 rounded-full bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#34D399]">
            <span className="material-symbols-outlined text-[36px]">
              task_alt
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-headline text-[22px] font-bold text-[#F1F5F9]">
              Queue Clear!
            </h2>
            <p className="text-[15px] text-[#94A3B8] max-w-sm">
              All due concepts have been reviewed. Items will return automatically in 1, 3, or 7 days according to your retention pace.
            </p>
          </div>

          <div className="w-full max-w-xs mt-2">
            <Button variant="secondary" onClick={() => window.history.back()}>
              Return to dashboard
            </Button>
          </div>
        </Card>
      )}

      {/* Full Library of Queue Items */}
      <div className="flex flex-col gap-3 mt-4">
        <span className="text-[13px] font-mono text-[#94A3B8] uppercase tracking-wider">
          All Monitored Concepts ({items.length})
        </span>

        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <Card key={item.id} className="p-4 bg-[#121826] border-[#263047] flex items-center justify-between">
              <div className="flex flex-col gap-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-semibold text-[#F1F5F9]">
                    {item.conceptTitle}
                  </span>
                  <Chip variant={strengthColorMap[item.strength]} size="sm">
                    Box {item.box}
                  </Chip>
                </div>
                <span className="text-[13px] text-[#94A3B8] line-clamp-1">
                  {item.cueText}
                </span>
              </div>

              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[12px] font-mono text-[#22D3EE]">
                  Next: {item.nextReviewDate}
                </span>
                <span className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                  {item.intervalDays}d interval
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
