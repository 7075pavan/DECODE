"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface ApplyStepProps {
  applyData: {
    title: string;
    subtitle: string;
    missionPrompt: string;
    instructions: string[];
    reflectionQuestion: string;
  };
  unitTitle: string;
  onFinishUnit: (reflectionText: string) => void;
}

export const ApplyStep: React.FC<ApplyStepProps> = ({
  applyData,
  unitTitle,
  onFinishUnit,
}) => {
  const router = useRouter();
  const { addXP } = useAuthStore();
  const [reflection, setReflection] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isValid = reflection.trim().length >= 15;

  const handleSubmit = () => {
    if (!isValid) return;
    addXP(60);
    setIsCompleted(true);
    onFinishUnit(reflection);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3">
        <span className="text-[13px] font-mono text-[#22D3EE] font-semibold uppercase tracking-wider">
          Step 6 of 6 · Apply
        </span>
        <Chip variant="amber" size="sm">
          +60 XP Reward
        </Chip>
      </div>

      {!isCompleted ? (
        <div className="flex flex-col gap-5">
          {/* Mission Header */}
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-mono text-[#22D3EE]">
              {applyData.subtitle}
            </span>
            <h1 className="font-headline text-[24px] md:text-[28px] font-bold text-[#F1F5F9]">
              {applyData.title}
            </h1>
            <p className="text-[15px] text-[#94A3B8] leading-relaxed mt-1">
              {applyData.missionPrompt}
            </p>
          </div>

          {/* Action Checkpoints */}
          <Card className="bg-[#121826] border-[#263047] p-5 flex flex-col gap-3">
            <span className="text-[13px] font-mono text-[#F1F5F9] font-semibold uppercase tracking-wider">
              Field Checkpoints
            </span>
            <div className="flex flex-col gap-2.5">
              {applyData.instructions.map((inst, idx) => {
                const isChecked = Boolean(checkedItems[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isChecked
                          ? "bg-[#22D3EE] border-[#22D3EE] text-[#0B0F1A]"
                          : "border-[#859397] group-hover:border-[#22D3EE]"
                      }`}
                    >
                      {isChecked && (
                        <span className="material-symbols-outlined text-[16px] font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[14px] leading-relaxed transition-colors ${
                        isChecked
                          ? "text-[#F1F5F9] font-medium"
                          : "text-[#94A3B8] group-hover:text-[#dfe2f2]"
                      }`}
                    >
                      {inst}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Reflection Box: "What did you notice?" */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="reflection-input"
              className="font-headline text-[16px] font-semibold text-[#F1F5F9]"
            >
              What did you notice?
            </label>
            <p className="text-[13px] text-[#94A3B8]">
              {applyData.reflectionQuestion}
            </p>
            <textarea
              id="reflection-input"
              rows={4}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. During my call with our developer, his normal voice was energetic and warm. When I brought up the Monday release date, his voice dropped, he paused for 4 seconds, and cleared his throat twice..."
              className="w-full rounded-xl bg-[#121826] border border-[#263047] focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] text-[#F1F5F9] p-4 text-[15px] leading-relaxed outline-none transition-all placeholder:text-[#859397]/60"
            />
            <div className="flex items-center justify-between text-[12px] font-mono text-[#94A3B8]">
              <span>Minimum 15 characters required</span>
              <span className={isValid ? "text-[#34D399]" : "text-[#94A3B8]"}>
                {reflection.trim().length} chars
              </span>
            </div>
          </div>

          {/* 56px Primary Action Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              disabled={!isValid}
              onClick={handleSubmit}
              className="gap-2"
            >
              <span>Submit mission & complete unit</span>
              <span className="material-symbols-outlined text-[20px]">
                military_tech
              </span>
            </Button>
          </div>
        </div>
      ) : (
        /* UNIT COMPLETION DEBRIEF CELEBRATION */
        <div className="flex flex-col gap-6 animate-fadeIn py-4">
          <Card className="p-6 md:p-8 border-[#22D3EE]/40 bg-gradient-to-b from-[#121826] via-[#1A2233] to-[#0B0F1A] text-center flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-[#22D3EE]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 rounded-full bg-[#070A12] border-2 border-[#22D3EE] flex items-center justify-center shadow-xl shadow-[#22D3EE]/25 relative z-10">
              <span className="material-symbols-outlined text-[#22D3EE] text-[40px]">
                verified
              </span>
            </div>

            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-[13px] font-mono text-[#22D3EE] font-semibold uppercase tracking-wider">
                Unit 1 Decoded
              </span>
              <h2 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9]">
                {unitTitle}
              </h2>
              <p className="text-[15px] text-[#94A3B8] max-w-sm mx-auto mt-1">
                You have mastered the foundational laws of human baseline calibration.
              </p>
            </div>

            {/* Amber Reward Tokens */}
            <div className="flex items-center justify-center gap-3 w-full max-w-xs relative z-10">
              <div className="flex-1 flex flex-col items-center bg-[#121826] border border-[#263047] p-3 rounded-xl">
                <span className="text-[20px] font-bold text-[#F59E0B] font-mono leading-tight">
                  +60 XP
                </span>
                <span className="text-[12px] text-[#94A3B8] font-mono">Total Award</span>
              </div>
              <div className="flex-1 flex flex-col items-center bg-[#121826] border border-[#263047] p-3 rounded-xl">
                <span className="text-[20px] font-bold text-[#F59E0B] font-mono leading-tight flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                  +1
                </span>
                <span className="text-[12px] text-[#94A3B8] font-mono">Streak Active</span>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => router.push("/home")}
              className="gap-2"
            >
              <span>Back to home dashboard</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/paths")}
              className="h-[52px]"
            >
              Explore next unit in syllabus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
