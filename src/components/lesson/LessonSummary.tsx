"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { LeitnerItem } from "@/lib/srs/leitnerEngine";

export interface SessionStats {
  totalXPEarned: number;
  accuracy: number;
  brierScore: number;
  avgConfidence: number;
  calibrationMatchPercent: number;
  calibrationVerdict: string;
  missedConcepts: LeitnerItem[];
}

interface LessonSummaryProps {
  stats: SessionStats;
  onContinue: () => void;
  continueLabel?: string;
}

export const LessonSummary: React.FC<LessonSummaryProps> = ({
  stats,
  onContinue,
  continueLabel = "Proceed to mastery check",
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto py-4 animate-fadeIn">
      {/* Top Header */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-[#121826] border-2 border-[#22D3EE] flex items-center justify-center text-[#22D3EE] shadow-lg shadow-[#22D3EE]/20">
          <span className="material-symbols-outlined text-[32px]">fact_check</span>
        </div>
        <span className="text-[13px] font-mono text-[#22D3EE] font-semibold tracking-wider uppercase">
          Practice Debrief
        </span>
        <h1 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9]">
          Performance Telemetry
        </h1>
      </div>

      {/* 3 Metric Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Total XP in Master Amber */}
        <Card className="p-3.5 flex flex-col items-center text-center bg-[#121826] border-[#263047]">
          <span className="material-symbols-outlined text-[#F59E0B] text-[22px]">bolt</span>
          <span className="text-[20px] font-bold text-[#F59E0B] font-mono mt-1">
            +{stats.totalXPEarned}
          </span>
          <span className="text-[13px] text-[#94A3B8] font-mono mt-0.5">Total XP</span>
        </Card>

        {/* Accuracy */}
        <Card className="p-3.5 flex flex-col items-center text-center bg-[#121826] border-[#263047]">
          <span className="material-symbols-outlined text-[#34D399] text-[22px]">check_circle</span>
          <span className="text-[20px] font-bold text-[#34D399] font-mono mt-1">
            {stats.accuracy}%
          </span>
          <span className="text-[13px] text-[#94A3B8] font-mono mt-0.5">Accuracy</span>
        </Card>

        {/* Calibration Match */}
        <Card className="p-3.5 flex flex-col items-center text-center bg-[#121826] border-[#263047]">
          <span className="material-symbols-outlined text-[#22D3EE] text-[22px]">tune</span>
          <span className="text-[20px] font-bold text-[#22D3EE] font-mono mt-1">
            {stats.calibrationMatchPercent}%
          </span>
          <span className="text-[13px] text-[#94A3B8] font-mono mt-0.5">Calibration</span>
        </Card>
      </div>

      {/* Brier Score & Calibration Analysis */}
      <Card className="p-5 bg-[#121826] border-[#263047] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#22D3EE] text-[20px]">
              analytics
            </span>
            <span className="text-[15px] font-bold text-[#F1F5F9] font-headline">
              Confidence Calibration (Brier Score)
            </span>
          </div>
          <Chip variant="cyan" size="sm">
            {stats.calibrationVerdict}
          </Chip>
        </div>

        <div className="p-3 rounded-xl bg-[#1A2233] border border-[#263047] flex items-center justify-between text-[13px] font-mono">
          <div className="flex flex-col">
            <span className="text-[#94A3B8]">Brier Score (lower = better)</span>
            <span className="text-[#F1F5F9] font-bold text-[15px] mt-0.5">
              {stats.brierScore.toFixed(3)}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[#94A3B8]">Avg Confidence vs Accuracy</span>
            <span className="text-[#22D3EE] font-bold text-[15px] mt-0.5">
              {stats.avgConfidence}% cert / {stats.accuracy}% hit
            </span>
          </div>
        </div>

        <p className="text-[14px] text-[#94A3B8] leading-relaxed">
          {stats.brierScore <= 0.15
            ? "Exceptional calibration. When you stated high certainty, you were nearly always correct. When uncertain, you chose lower percentages, avoiding penalty points."
            : "Room to calibrate. Whenever signals feel ambiguous or non-verbal cues conflict, wager lower confidence (50%–70%) to protect against overconfidence deductions."}
        </p>
      </Card>

      {/* Concepts to Review (Leitner Queue) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-mono text-[#94A3B8] uppercase tracking-wider">
            Concepts Added to Review Queue
          </span>
          <span className="text-[13px] font-mono text-[#22D3EE]">
            Leitner Box 1 (Due in 1d)
          </span>
        </div>

        {stats.missedConcepts.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {stats.missedConcepts.map((item) => (
              <Card key={item.id} className="p-4 bg-[#121826] border-[#263047] flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#F87171] text-[18px]">
                      bookmark
                    </span>
                    <span className="text-[15px] font-semibold text-[#F1F5F9]">
                      {item.conceptTitle}
                    </span>
                  </div>
                  <Chip variant="coral" size="sm">
                    {item.strength}
                  </Chip>
                </div>
                <p className="text-[13px] text-[#94A3B8] leading-snug">
                  {item.explanation}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 bg-[#121826] border-[#34D399]/40 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#34D399] text-[24px]">
              verified
            </span>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-[#F1F5F9]">
                Zero Weak Concepts Detected
              </span>
              <span className="text-[13px] text-[#94A3B8]">
                Flawless deduction across all scenarios in this session.
              </span>
            </div>
          </Card>
        )}
      </div>

      {/* 56px Primary Action Button */}
      <div className="pt-2">
        <Button variant="primary" onClick={onContinue} className="gap-2">
          <span>{continueLabel}</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
};
