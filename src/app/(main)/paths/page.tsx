"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Chip } from "@/components/ui/Chip";
import { INITIAL_PATHS } from "@/content/paths";

export default function PathsPage() {
  const router = useRouter();

  const totalLessons = 75;
  const completedLessons = 0;
  const overallPercent = Math.round((completedLessons / totalLessons) * 100);

  const recommendedPath = INITIAL_PATHS[0];
  const otherPaths = INITIAL_PATHS.slice(1);

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9]">
          Learning paths
        </h1>
        <p className="text-[15px] text-[#94A3B8]">
          Five paths. Start with Reading People.
        </p>
      </div>

      {/* Overall Progress Card */}
      <Card className="flex items-center justify-between p-5 bg-[#121826] border-[#263047]">
        <div className="flex items-center gap-4">
          <ProgressRing progress={overallPercent} size={64} strokeWidth={5} color="cyan">
            <span className="font-mono text-[14px] font-bold text-[#F1F5F9]">
              {overallPercent}%
            </span>
          </ProgressRing>

          <div className="flex flex-col">
            <span className="text-[13px] font-mono text-[#94A3B8] uppercase tracking-wider">
              Overall progress
            </span>
            <span className="text-[17px] font-bold text-[#F1F5F9]">
              {overallPercent}% completed
            </span>
            <span className="text-[14px] text-[#94A3B8] mt-0.5">
              {completedLessons} of {totalLessons} lessons
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-[#1A2233] border border-[#263047] px-3 py-1.5 rounded-full text-[13px] font-mono text-[#22D3EE]">
          <span className="material-symbols-outlined text-[16px]">flag</span>
          <span>Ready to start</span>
        </div>
      </Card>

      {/* Active Focus Card: Path 1 (Recommended) */}
      <Card className="border-[#22D3EE]/40 bg-gradient-to-br from-[#121826] to-[#0F1422] p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-mono font-semibold text-[#22D3EE] tracking-wide">
              {recommendedPath.subtitle}
            </span>
          </div>
          <Chip variant="default" className="text-[13px]">
            Beginner
          </Chip>
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A2233] border border-[#263047] flex items-center justify-center text-[#22D3EE] flex-shrink-0">
            <span className="material-symbols-outlined text-[26px]">
              {recommendedPath.icon}
            </span>
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline text-[22px] md:text-[24px] font-bold text-[#F1F5F9]">
              {recommendedPath.title}
            </h2>
            <p className="text-[15px] text-[#94A3B8] mt-1 leading-relaxed">
              {recommendedPath.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-[13px] font-mono text-[#94A3B8] mb-5 bg-[#1A2233] p-3 rounded-lg border border-[#263047]">
          <div className="flex items-center gap-2">
            <ProgressRing progress={0} size={28} strokeWidth={3} color="cyan" />
            <span>0 of {recommendedPath.totalLessons} lessons</span>
          </div>
          <span className="text-[#22D3EE] font-semibold">Active focus</span>
        </div>

        {/* 56px Primary Button */}
        <Button
          variant="primary"
          onClick={() => router.push(`/paths/${recommendedPath.id}`)}
          className="gap-2"
        >
          <span>Continue path</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Button>
      </Card>

      {/* Other Paths List (Paths 2-5) */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-mono text-[#94A3B8] uppercase tracking-wider">
          More Paths
        </span>

        {otherPaths.map((path) => (
          <Card
            key={path.id}
            variant="interactive"
            onClick={() => router.push(`/paths/${path.id}`)}
            className="flex items-center justify-between p-4 md:p-5"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#1A2233] flex items-center justify-center text-[#22D3EE] flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[22px]">
                  {path.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono text-[#94A3B8]">
                    {path.subtitle}
                  </span>
                  <span className="text-[13px] font-mono text-[#94A3B8]">•</span>
                  <span className="text-[13px] font-mono text-[#94A3B8]">
                    0 of {path.totalLessons} lessons
                  </span>
                </div>
                <h3 className="font-headline text-[18px] font-semibold text-[#F1F5F9] mt-0.5">
                  {path.title}
                </h3>
                <p className="text-[14px] text-[#94A3B8] mt-1 leading-snug">
                  {path.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <span className="hidden sm:inline text-[13px] font-mono text-[#94A3B8]">
                Open
              </span>
              <span className="material-symbols-outlined text-[#94A3B8]">
                chevron_right
              </span>
            </div>
          </Card>
        ))}

        {/* Locked Advanced Scenarios Card */}
        <div className="flex items-center justify-between p-4 md:p-5 rounded-xl bg-[#121826]/60 border border-[#263047] opacity-75">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#1A2233]/50 flex items-center justify-center text-[#94A3B8] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-[#94A3B8]">
                Advanced scenarios
              </span>
              <span className="text-[13px] text-[#859397] mt-0.5">
                Unlocks after completing your first 40 lessons
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#859397]">
            chevron_right
          </span>
        </div>
      </div>
    </div>
  );
}
