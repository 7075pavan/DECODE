"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Slider } from "@/components/ui/Slider";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { calculateStepXP } from "@/lib/scoring/scoringEngine";

export function DailyChallengeCard() {
  const { addXP } = useAuthStore();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(80);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    xpEarned: number;
    explanation: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("8h 24m");

  // Daily Challenge Scenario
  const challenge = {
    id: "daily-2026-11-17",
    category: "Influence & Founder Money",
    title: "The Exploding Term Sheet",
    scenario:
      "At 11 PM on a Sunday, an angel investor emails a term sheet offering ₹40 Lakhs for 38% equity in your 6-month-old AI startup, stating: 'This offer is only valid if signed by 9 AM tomorrow.' What is the forensic diagnosis?",
    options: [
      "Accept immediately because early cash is always the #1 priority.",
      "An artificial urgency trap designed to bypass legal counsel and lock up a predatory 38% stake, fatally damaging your cap table for future institutional rounds.",
      "Counter-offer with 50% equity to build a stronger partnership.",
      "Assume the investor's clock is broken and ignore it for a week.",
    ],
    correctIndex: 1,
    explanation:
      "Exploding deadlines in venture deals are classic artificial urgency maneuvers. Legitimate institutional partners never demand 38% dilution overnight without giving founders time to consult legal counsel.",
  };

  useEffect(() => {
    // Check local storage for today's completion
    const saved = localStorage.getItem(`decode_daily_${challenge.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setIsCompleted(true);
        setFeedback(parsed);
      } catch (e) {}
    }

    // Simple countdown to midnight
    const updateTime = () => {
      const now = new Date();
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0
      );
      const diffMs = endOfDay.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${mins}m`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [challenge.id]);

  const handleSubmit = () => {
    if (selectedOption === null) return;

    const isCorrect = selectedOption === challenge.correctIndex;
    const stepRes = calculateStepXP(isCorrect, confidence);
    const finalXP = Math.max(20, stepRes.stepXP + 40); // 50+ XP bonus for daily challenge

    addXP(finalXP);

    const result = {
      isCorrect,
      xpEarned: finalXP,
      explanation: challenge.explanation,
    };

    setFeedback(result);
    setIsCompleted(true);
    localStorage.setItem(`decode_daily_${challenge.id}`, JSON.stringify(result));
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-[#121826] to-[#0A0F1D] border-[#22D3EE]/30 relative overflow-hidden">
      {/* Background glowing indicator */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#22D3EE]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] animate-pulse" />
          <span className="text-[12px] font-mono text-[#22D3EE] font-bold tracking-wider uppercase">
            Daily Forensic Challenge
          </span>
          <Chip variant="amber" size="sm">
            +50 XP
          </Chip>
        </div>

        <div className="flex items-center gap-1.5 text-[12px] font-mono text-[#94A3B8]">
          <span className="material-symbols-outlined text-[16px]">timer</span>
          <span>Resets in {timeLeft}</span>
        </div>
      </div>

      <h3 className="font-headline text-[18px] md:text-[20px] font-bold text-[#F1F5F9]">
        {challenge.title}
      </h3>
      <p className="text-[14px] text-[#94A3B8] mt-1.5 leading-relaxed">
        {challenge.scenario}
      </p>

      {/* Form or Completed Feedback */}
      {!isCompleted ? (
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {challenge.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl text-[14px] leading-relaxed transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-[#22D3EE]/15 border-2 border-[#22D3EE] text-[#F1F5F9] font-medium"
                      : "bg-[#1A2233] border border-[#263047] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#38BDF8]/40"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-mono font-bold mt-0.5 ${
                      isSelected
                        ? "bg-[#22D3EE] text-[#0B0F1A]"
                        : "bg-[#0B0F1A] border border-[#263047] text-[#94A3B8]"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Confidence Slider */}
          <div className="mt-2 pt-3 border-t border-[#263047]">
            <Slider
              label="Calibration Wager"
              value={confidence}
              min={50}
              max={100}
              step={5}
              onChange={setConfidence}
            />
          </div>

          {/* Submit Button */}
          <Button
            variant="primary"
            className="w-full h-12 mt-2"
            disabled={selectedOption === null}
            onClick={handleSubmit}
          >
            Submit Daily Deduction
          </Button>
        </div>
      ) : (
        <div className="mt-5 p-4 rounded-2xl bg-[#0B0F1A] border border-[#263047] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`material-symbols-outlined text-[24px] ${
                  feedback?.isCorrect ? "text-[#10B981]" : "text-[#EF4444]"
                }`}
              >
                {feedback?.isCorrect ? "check_circle" : "cancel"}
              </span>
              <span className="font-headline text-[15px] font-bold text-[#F1F5F9]">
                {feedback?.isCorrect
                  ? "Deduction Confirmed!"
                  : "Calibration Alert"}
              </span>
            </div>

            <Chip variant="amber" size="sm">
              +{feedback?.xpEarned || 50} XP Claimed
            </Chip>
          </div>

          <p className="text-[13px] text-[#94A3B8] leading-relaxed">
            {feedback?.explanation}
          </p>

          <span className="text-[12px] font-mono text-[#22D3EE] text-center pt-1">
            Challenge solved for today. Come back tomorrow for the next diagnostic.
          </span>
        </div>
      )}
    </Card>
  );
}
