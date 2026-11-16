"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StepPreview {
  number: number;
  title: string;
  desc: string;
  icon: string;
}

const LESSON_STEPS: StepPreview[] = [
  {
    number: 1,
    title: "Step 1: Learn",
    desc: "Core concept and basic rules",
    icon: "menu_book",
  },
  {
    number: 2,
    title: "Step 2: See",
    desc: "Real worked examples in action",
    icon: "visibility",
  },
  {
    number: 3,
    title: "Step 3: Try",
    desc: "Quick interactive practice questions",
    icon: "quiz",
  },
  {
    number: 4,
    title: "Step 4: Review",
    desc: "Helpful breakdowns and advice",
    icon: "fact_check",
  },
  {
    number: 5,
    title: "Step 5: Prove",
    desc: "Test your understanding",
    icon: "check_circle",
  },
  {
    number: 6,
    title: "Step 6: Apply",
    desc: "Put it to work in everyday life",
    icon: "explore",
  },
];

const GOAL_OPTIONS: { minutes: 5 | 10 | 15; label: string; isRecommended?: boolean }[] = [
  { minutes: 5, label: "5 min a day" },
  { minutes: 10, label: "10 min a day", isRecommended: true },
  { minutes: 15, label: "15 min a day" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setDailyGoal, completeOnboarding } = useAuthStore();
  const [selectedGoal, setSelectedGoal] = useState<5 | 10 | 15>(
    user?.dailyGoalMinutes || 10
  );

  const handleFinish = () => {
    setDailyGoal(selectedGoal);
    completeOnboarding();
    router.push("/home");
  };

  return (
    <main className="flex-1 flex flex-col justify-between w-full min-h-screen bg-[#0B0F1A] text-[#F1F5F9] pt-safe pb-safe px-5 py-6">
      <div className="w-full max-w-[500px] mx-auto flex flex-col flex-1">
        {/* Top bar with Skip button */}
        <div className="flex items-center justify-end w-full mb-4">
          <button
            type="button"
            onClick={handleFinish}
            className="text-[14px] text-[#94A3B8] hover:text-[#F1F5F9] font-medium transition-colors cursor-pointer py-1 px-2"
          >
            Skip
          </button>
        </div>

        {/* Section 1: How DECODE Works */}
        <div className="flex flex-col gap-1 mb-5">
          <h1 className="font-headline text-[26px] font-bold text-[#F1F5F9]">
            How DECODE works
          </h1>
          <p className="text-[15px] text-[#94A3B8]">
            Six simple steps for every lesson.
          </p>
        </div>

        {/* The 6 Steps Cards */}
        <div className="flex flex-col gap-2.5 mb-8">
          {LESSON_STEPS.map((step) => (
            <div
              key={step.number}
              className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#121826] border border-[#263047] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1A2233] flex items-center justify-center text-[#22D3EE] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  {step.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#F1F5F9] leading-tight">
                  {step.title}
                </span>
                <span className="text-[13px] text-[#94A3B8] leading-tight mt-0.5">
                  {step.desc}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Daily Goal Setup */}
        <div className="flex flex-col gap-1 mb-4">
          <h2 className="font-headline text-[20px] font-bold text-[#F1F5F9]">
            Daily goal
          </h2>
          <p className="text-[14px] text-[#94A3B8]">
            Choose your daily learning pace.
          </p>
        </div>

        {/* Goal Selector Options */}
        <div className="flex flex-col gap-2.5 mb-8">
          {GOAL_OPTIONS.map((option) => {
            const isSelected = selectedGoal === option.minutes;
            return (
              <div
                key={option.minutes}
                onClick={() => setSelectedGoal(option.minutes)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-150 select-none",
                  isSelected
                    ? "bg-[#1A2233] border-[#22D3EE] shadow-[0_0_16px_-4px_rgba(34,211,238,0.25)]"
                    : "bg-[#121826] border-[#263047] hover:border-[#22D3EE]/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "material-symbols-outlined text-[20px]",
                      isSelected ? "text-[#22D3EE]" : "text-[#94A3B8]"
                    )}
                  >
                    timer
                  </span>
                  <span
                    className={cn(
                      "text-[15px] font-medium",
                      isSelected ? "text-[#F1F5F9] font-semibold" : "text-[#F1F5F9]"
                    )}
                  >
                    {option.label}
                    {option.isRecommended && (
                      <span className="text-[#22D3EE] ml-1.5 text-[13px] font-mono font-normal">
                        (Recommended)
                      </span>
                    )}
                  </span>
                </div>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-[#22D3EE] bg-[#22D3EE]"
                      : "border-[#859397] bg-transparent"
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-[#0B0F1A]" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 56px Primary Action Button */}
        <div className="mt-auto pt-4">
          <Button variant="primary" onClick={handleFinish} className="gap-2">
            <span>Continue</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </Button>
        </div>
      </div>
    </main>
  );
}
