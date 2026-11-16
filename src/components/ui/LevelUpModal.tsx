"use client";

import React from "react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/Button";

const RANK_BADGES: Record<string, { icon: string; subtitle: string; description: string }> = {
  Rookie: {
    icon: "visibility",
    subtitle: "Level 1 Operative",
    description: "Beginning calibration of human baseline behavior.",
  },
  Observer: {
    icon: "search",
    subtitle: "Level 2 Field Analyst",
    description: "Detects subtle micro-tensions and kinetic body language leaks.",
  },
  Analyst: {
    icon: "psychology",
    subtitle: "Level 3 Cognitive Specialist",
    description: "Reads behavioral clusters across vocal and facial channels.",
  },
  Profiler: {
    icon: "shield",
    subtitle: "Level 4 Tactical Profiler",
    description: "Calibrated deduction under high stakes and pressure.",
  },
  "Master Reader": {
    icon: "military_tech",
    subtitle: "Level 5 Master Operative",
    description: "Flawless perceptual acuity across all human psychological signals.",
  },
};

export const LevelUpModal: React.FC = () => {
  const { levelUpEvent, clearLevelUpEvent } = useAuthStore();

  if (!levelUpEvent) return null;

  const info = RANK_BADGES[levelUpEvent.newRank] || RANK_BADGES["Observer"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#1A2233] via-[#121826] to-[#0B0F1A] border-2 border-[#F59E0B] p-6 text-center shadow-[0_0_50px_-5px_rgba(245,158,11,0.4)] flex flex-col items-center gap-4">
        {/* Amber Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#F59E0B]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Level Up Badge Icon with Ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#F59E0B]/30 blur-xl scale-125 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-[#070A12] border-2 border-[#F59E0B] p-1 flex items-center justify-center shadow-xl shadow-[#F59E0B]/30">
            <div className="w-16 h-16 rounded-full bg-[#261B0B] border border-[#F59E0B]/50 flex items-center justify-center text-[#F59E0B]">
              <span className="material-symbols-outlined text-[36px]">
                {info.icon}
              </span>
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-1 relative z-10">
          <span className="text-[12px] font-mono font-bold text-[#F59E0B] uppercase tracking-widest">
            Rank Promotion
          </span>
          <h2 className="font-headline text-[26px] font-bold text-[#F1F5F9]">
            {levelUpEvent.newRank}
          </h2>
          <span className="text-[13px] font-mono text-[#22D3EE] font-semibold">
            {info.subtitle}
          </span>
          <p className="text-[14px] text-[#94A3B8] mt-1 leading-relaxed">
            {info.description}
          </p>
        </div>

        {/* Previous Rank Tag */}
        <div className="flex items-center gap-2 bg-[#121826] border border-[#263047] px-3 py-1.5 rounded-full text-[12px] font-mono text-[#94A3B8] relative z-10">
          <span>{levelUpEvent.oldRank}</span>
          <span className="material-symbols-outlined text-[14px] text-[#22D3EE]">
            arrow_forward
          </span>
          <span className="text-[#F59E0B] font-bold">{levelUpEvent.newRank}</span>
        </div>

        {/* Claim Button */}
        <div className="w-full pt-2 relative z-10">
          <Button
            variant="primary"
            onClick={clearLevelUpEvent}
            className="bg-[#F59E0B] hover:bg-[#fbbf24] text-[#070A12] font-bold shadow-lg shadow-[#F59E0B]/25"
          >
            Claim rank & continue
          </Button>
        </div>
      </div>
    </div>
  );
};
