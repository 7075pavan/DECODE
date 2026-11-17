"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PATHS_DATA } from "@/content/paths";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { WindingPath } from "@/components/paths/WindingPath";

export default function PathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const pathId = params?.pathId as string;
  const path = PATHS_DATA.find((p) => p.id === pathId) || PATHS_DATA[0];

  const unlockedUnits = user?.unlockedUnits || [
    "reading-people-unit-1",
    "detective-mind-unit-1",
    "mind-and-mindset-unit-1",
    "influence-negotiation-unit-1",
    "money-wealth-unit-1",
  ];
  const completedUnits = user?.completedUnits || [];
  const earnedBadges = user?.earnedBadges || [];

  const [viewMode, setViewMode] = useState<"winding" | "list">("winding");

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-[14px] text-[#94A3B8]">
        <Link
          href="/paths"
          className="hover:text-[#22D3EE] transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Paths</span>
        </Link>
        <span>/</span>
        <span className="text-[#F1F5F9] font-medium">{path.title}</span>
      </div>

      {/* Path Header Hero */}
      <Card className="p-6 bg-gradient-to-br from-[#121826] to-[#0F1422] border-[#263047] relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1A2233] border border-[#263047] flex items-center justify-center text-[#22D3EE] flex-shrink-0">
            <span className="material-symbols-outlined text-[30px]">{path.icon}</span>
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-mono text-[#22D3EE] font-semibold">
                {path.subtitle}
              </span>
              <Chip variant="default" size="sm">
                {completedUnits.filter((id) => id.startsWith(path.id)).length} of{" "}
                {path.totalLessons} units mastered
              </Chip>
            </div>
            <h1 className="font-headline text-[24px] md:text-[28px] font-bold text-[#F1F5F9] mt-1">
              {path.title}
            </h1>
            <p className="text-[15px] text-[#94A3B8] mt-1 leading-relaxed">
              {path.description}
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-5 pt-4 border-t border-[#263047] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("winding")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-mono transition-colors ${
                viewMode === "winding"
                  ? "bg-[#22D3EE]/20 border border-[#22D3EE] text-[#22D3EE]"
                  : "bg-[#1A2233] border border-[#263047] text-[#94A3B8] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">timeline</span>
              <span>Winding Path</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-mono transition-colors ${
                viewMode === "list"
                  ? "bg-[#22D3EE]/20 border border-[#22D3EE] text-[#22D3EE]"
                  : "bg-[#1A2233] border border-[#263047] text-[#94A3B8] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>Syllabus List</span>
            </button>
          </div>

          {path.id === "money-wealth" && (
            <Link
              href="/simulator"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-[13px] font-mono hover:bg-[#F59E0B]/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Money Simulator</span>
            </Link>
          )}
        </div>
      </Card>

      {/* Main Path Body: Winding Nodes or List */}
      {viewMode === "winding" ? (
        <Card className="p-6 bg-[#121826] border-[#263047] overflow-hidden">
          <div className="text-center mb-4">
            <span className="text-[13px] font-mono uppercase text-[#94A3B8] tracking-wider">
              Tap any unlocked unit node to inspect the 6-step loop
            </span>
          </div>
          <WindingPath
            pathId={path.id}
            pathTitle={path.title}
            units={path.units}
            unlockedUnits={unlockedUnits}
            completedUnits={completedUnits}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {path.units.map((unit) => {
            const isCompleted = completedUnits.includes(unit.id);
            const isUnlocked =
              unit.isUnlockedDefault ||
              unlockedUnits.includes(unit.id) ||
              unit.unitNumber === 1;

            return (
              <Card
                key={unit.id}
                className={`p-5 border transition-all ${
                  isCompleted
                    ? "bg-[#121826] border-[#10B981]/30"
                    : isUnlocked
                    ? "bg-[#121826] border-[#22D3EE]/30"
                    : "bg-[#121826]/60 border-[#263047] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                          : isUnlocked
                          ? "bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40"
                          : "bg-[#1A2233] text-[#64748B] border border-[#263047]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isCompleted
                          ? "check"
                          : unit.isMasteryShield
                          ? "security"
                          : isUnlocked
                          ? "play_arrow"
                          : "lock"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono text-[#94A3B8]">
                          Unit {unit.unitNumber}
                        </span>
                        {unit.isMasteryShield && (
                          <Chip variant="amber" size="sm">
                            Mastery Shield
                          </Chip>
                        )}
                      </div>
                      <h3 className="font-headline text-[16px] font-bold text-[#F1F5F9] mt-0.5">
                        {unit.title}
                      </h3>
                      <p className="text-[13px] text-[#94A3B8] mt-1 leading-relaxed">
                        {unit.description}
                      </p>
                      <span className="text-[13px] font-mono text-[#22D3EE] mt-2">
                        {unit.estimatedMinutes} min · {unit.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <div>
                    {unit.isPlayable && isUnlocked ? (
                      <Button
                        variant={isCompleted ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => router.push(`/lesson/${unit.id}`)}
                      >
                        {isCompleted ? "Review" : "Start"}
                      </Button>
                    ) : (
                      <span className="text-[13px] font-mono text-[#64748B] px-3 py-1.5 rounded-lg bg-[#1A2233] border border-[#263047]">
                        {unit.isPlayable ? "Locked" : "Coming Soon"}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
