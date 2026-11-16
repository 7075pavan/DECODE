"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";

interface LearnStepProps {
  learnData: any;
  onComplete: () => void;
}

export const LearnStep: React.FC<LearnStepProps> = ({ learnData, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cards = learnData.cards;
  const currentCard = cards[currentIndex];
  const isLastCard = currentIndex === cards.length - 1;

  const handleNext = () => {
    if (isLastCard) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="flex flex-col justify-between w-full max-w-xl mx-auto min-h-[580px] py-4">
      {/* Top Header & Progress */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono text-[#22D3EE] font-semibold uppercase tracking-wider">
            Step 1 of 6 · Learn
          </span>
          <span className="text-[13px] font-mono text-[#94A3B8]">
            Card {currentIndex + 1} of {cards.length}
          </span>
        </div>
        <ProgressBar progress={progressPercent} color={currentCard.isKeyRule ? "amber" : "cyan"} />
      </div>

      {/* Main Card View */}
      <div className="my-6 flex-1 flex flex-col justify-center">
        <Card
          className={`p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
            currentCard.isKeyRule
              ? "border-[#F59E0B] bg-gradient-to-br from-[#121826] via-[#1A2233] to-[#261B0B] shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)]"
              : "border-[#263047] bg-[#121826]"
          }`}
        >
          {/* Subtle Ambient Glow */}
          {currentCard.isKeyRule ? (
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F59E0B]/15 rounded-full blur-3xl pointer-events-none" />
          ) : (
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />
          )}

          <div>
            {/* Card Badge & Icon */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  currentCard.isKeyRule
                    ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 shadow-lg shadow-[#F59E0B]/20"
                    : "bg-[#1A2233] text-[#22D3EE] border border-[#263047]"
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">
                  {currentCard.icon}
                </span>
              </div>

              {currentCard.isKeyRule ? (
                <Chip variant="amber" className="font-bold">
                  Key Rule
                </Chip>
              ) : (
                <span className="text-[13px] font-mono text-[#94A3B8]">
                  {currentCard.step}
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <span
              className={`text-[13px] font-mono font-semibold tracking-wide uppercase block ${
                currentCard.isKeyRule ? "text-[#F59E0B]" : "text-[#22D3EE]"
              }`}
            >
              {currentCard.subtitle}
            </span>
            <h2 className="font-headline text-[22px] md:text-[26px] font-bold text-[#F1F5F9] mt-1 mb-4 leading-tight">
              {currentCard.title}
            </h2>

            {/* Content paragraph - Never truncated */}
            <p className="text-[16px] text-[#dfe2f2] leading-relaxed mb-6 font-body">
              {currentCard.content}
            </p>
          </div>

          {/* Takeaway Box */}
          <div
            className={`p-4 rounded-xl border ${
              currentCard.isKeyRule
                ? "bg-[#261B0B]/80 border-[#F59E0B]/40 text-[#FEF3C7]"
                : "bg-[#1A2233] border-[#263047] text-[#94A3B8]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`material-symbols-outlined text-[18px] ${
                  currentCard.isKeyRule ? "text-[#F59E0B]" : "text-[#22D3EE]"
                }`}
              >
                lightbulb
              </span>
              <span
                className={`text-[13px] font-mono font-bold uppercase tracking-wider ${
                  currentCard.isKeyRule ? "text-[#F59E0B]" : "text-[#22D3EE]"
                }`}
              >
                Key Takeaway
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-[#F1F5F9] font-medium">
              {currentCard.takeaway}
            </p>
          </div>
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col gap-3">
        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mb-1">
          {cards.map((c: any, index: number) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to card ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                index === currentIndex
                  ? c.isKeyRule
                    ? "w-8 bg-[#F59E0B]"
                    : "w-8 bg-[#22D3EE]"
                  : "w-2 bg-[#263047] hover:bg-[#859397]"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {currentIndex > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              className="w-auto px-5 h-[56px] text-[15px] flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Button>
          )}

          <Button variant="primary" onClick={handleNext} className="gap-2 flex-1">
            <span>{isLastCard ? "Proceed to worked example (See)" : "Next concept"}</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
