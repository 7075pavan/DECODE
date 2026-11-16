"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { INITIAL_PATHS } from "@/content/paths";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function PathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const pathId = params?.pathId as string;
  const path = INITIAL_PATHS.find((p) => p.id === pathId) || INITIAL_PATHS[0];

  const unlockedUnits = user?.unlockedUnits || ["reading-people-unit-1"];
  const completedUnits = user?.completedUnits || [];
  const earnedBadges = user?.earnedBadges || [];

  const isUnit2Unlocked = unlockedUnits.includes("reading-people-unit-2");
  const isUnit1Completed = completedUnits.includes("reading-people-unit-1");

  const units = [
    {
      id: "reading-people-unit-1",
      title: "Unit 1: Baseline Calibration",
      description: "Master resting demeanor, vocal pitch, and kinetic leaks before looking for tells.",
      isUnlocked: true,
      isCompleted: isUnit1Completed,
      lessons: [
        {
          id: "reading-people-1",
          stepNumber: 1,
          title: "Spotting Baselines",
          time: "8 min",
          status: "active",
        },
      ],
    },
    {
      id: "reading-people-unit-2",
      title: "Unit 2: Deception Indicators",
      description: "Detect clusters of incongruence across facial cues and vocal cadence.",
      isUnlocked: isUnit2Unlocked,
      isCompleted: false,
      unlockNote: "Requires 80%+ on Unit 1 Mastery Check",
      lessons: [
        {
          id: "reading-people-2",
          stepNumber: 2,
          title: "Masked Expressions & Throat Tensions",
          time: "8 min",
          status: isUnit2Unlocked ? "active" : "locked",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-[14px] text-[#94A3B8]">
        <Link href="/paths" className="hover:text-[#22D3EE] transition-colors flex items-center gap-1">
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
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-mono text-[#22D3EE] font-semibold">
                {path.subtitle}
              </span>
              <Chip variant="default" size="sm">
                {completedUnits.length} of {path.totalLessons} lessons
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

        {/* Earned Badges Carousel */}
        {earnedBadges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#263047] flex items-center gap-3">
            <span className="text-[12px] font-mono text-[#F59E0B] uppercase font-bold">
              Badges Earned:
            </span>
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[13px] font-mono text-[#F59E0B]"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {badge.icon}
                </span>
                <span>{badge.title}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Units Syllabus */}
      <div className="flex flex-col gap-6">
        {units.map((unit) => (
          <div key={unit.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline text-[18px] font-bold text-[#F1F5F9]">
                    {unit.title}
                  </h2>
                  {unit.isCompleted && (
                    <span className="material-symbols-outlined text-[#34D399] text-[18px]">
                      check_circle
                    </span>
                  )}
                </div>
                <span className="text-[14px] text-[#94A3B8]">
                  {unit.description}
                </span>
              </div>

              {!unit.isUnlocked && (
                <Chip variant="coral" size="sm">
                  Locked
                </Chip>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              {unit.lessons.map((lesson) => {
                const isActive = unit.isUnlocked;
                return (
                  <Card
                    key={lesson.id}
                    variant={isActive ? "interactive" : "default"}
                    onClick={isActive ? () => router.push(`/lesson/${unit.id}`) : undefined}
                    className={`flex items-center justify-between p-4 ${
                      isActive
                        ? "border-[#22D3EE]/50 bg-[#1A2233]"
                        : "opacity-60 bg-[#121826] cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-[14px] ${
                          isActive
                            ? "bg-[#22D3EE] text-[#0B0F1A]"
                            : "bg-[#263047] text-[#94A3B8]"
                        }`}
                      >
                        {lesson.stepNumber}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[16px] font-semibold text-[#F1F5F9]">
                          {lesson.title}
                        </span>
                        <span className="text-[13px] text-[#94A3B8] font-mono">
                          {lesson.time} • 6 forensic steps
                          {!unit.isUnlocked && unit.unlockNote && ` (${unit.unlockNote})`}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/lesson/${unit.id}`);
                        }}
                        className="w-auto px-4 h-[40px] text-[13px]"
                      >
                        {unit.isCompleted ? "Replay" : "Start"}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[#859397] text-[13px] font-mono">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                        <span className="hidden sm:inline">80% required</span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
