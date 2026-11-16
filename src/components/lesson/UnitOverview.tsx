"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

interface UnitOverviewProps {
  onStart: () => void;
  unitData: any;
}

export const UnitOverview: React.FC<UnitOverviewProps> = ({ onStart, unitData }) => {
  const steps = [
    { num: 1, name: "Learn", desc: "5 foundation cards with Key Rule", icon: "menu_book" },
    { num: 2, name: "See", desc: "Bangalore client pitch worked example", icon: "visibility" },
    { num: 3, name: "Try", desc: "3 interactive cases with 3 steps each", icon: "quiz" },
    { num: 4, name: "Review", desc: "Cognitive feedback & clue strengths", icon: "fact_check" },
    { num: 5, name: "Prove", desc: "8-question mastery diagnostic (80% pass)", icon: "check_circle" },
    { num: 6, name: "Apply", desc: "Real-world 3-minute baseline mission", icon: "explore" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto py-4">
      {/* Unit Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-mono text-[#22D3EE] font-semibold tracking-wide">
            {unitData.subtitle}
          </span>
          <Chip variant="amber" size="sm">
            +{unitData.xpReward} XP
          </Chip>
        </div>
        <h1 className="font-headline text-[28px] md:text-[32px] font-bold text-[#F1F5F9]">
          {unitData.title}
        </h1>
        <p className="text-[16px] text-[#94A3B8] leading-relaxed">
          {unitData.description}
        </p>
      </div>

      {/* Rules to Master Callout */}
      <Card className="bg-[#121826] border-[#263047] p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#22D3EE] text-[20px]">
            verified
          </span>
          <span className="text-[15px] font-bold text-[#F1F5F9] font-headline">
            Core rules you will master
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {unitData.rulesSummary.map((rule: string, i: number) => (
            <div key={i} className="flex items-start gap-2.5 text-[14px] text-[#94A3B8] leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] mt-2 flex-shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 6-Step Loop Roadmap */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-mono text-[#94A3B8] uppercase tracking-wider">
          The 6-Step Lesson Loop
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {steps.map((s) => (
            <div
              key={s.num}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#121826] border border-[#263047]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#1A2233] flex items-center justify-center text-[#22D3EE] flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  {s.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-semibold text-[#F1F5F9] leading-tight">
                  Step {s.num}: {s.name}
                </span>
                <span className="text-[12px] text-[#94A3B8] leading-tight mt-0.5">
                  {s.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary 56px Action Button */}
      <div className="pt-2">
        <Button variant="primary" onClick={onStart} className="gap-2">
          <span>Start lesson ({unitData.estimatedMinutes} min)</span>
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </Button>
      </div>
    </div>
  );
};
