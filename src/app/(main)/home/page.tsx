"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useReviewStore } from "@/lib/stores/useReviewStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Chip } from "@/components/ui/Chip";
import { INITIAL_PATHS, CURRENT_ACTIVE_LESSON } from "@/content/paths";
import {
  ActiveResumeState,
  getStoredResumeState,
  subscribeToCrossDeviceSync,
} from "@/lib/sync/syncEngine";
import { DailyChallengeCard } from "@/components/home/DailyChallengeCard";

export default function HomePage() {
  const router = useRouter();
  const { user, useStreakFreeze } = useAuthStore();
  const { getDueCount } = useReviewStore();

  const [resumeState, setResumeState] = useState<ActiveResumeState | null>(null);
  const dueReviewCount = getDueCount();

  // Load initial stored resume state & listen for real-time cross-device updates
  useEffect(() => {
    const local = getStoredResumeState();
    if (local) setResumeState(local);

    const unsub = subscribeToCrossDeviceSync(user?.uid || null, (remote) => {
      setResumeState(remote);
    });

    return () => unsub();
  }, [user?.uid]);

  const minutesGoal = user?.dailyGoalMinutes || 10;
  const minutesCompleted = user?.dailyMinutesToday || 0;
  const goalProgress = Math.min(100, Math.round((minutesCompleted / minutesGoal) * 100));
  const freezeTokens = user?.streak.freezeTokens ?? 1;

  const handleUseFreeze = () => {
    if (freezeTokens > 0) {
      useStreakFreeze();
      alert("Streak Freeze activated! Your streak is protected for the next 24 hours.");
    }
  };

  const handleResumeClick = () => {
    if (resumeState) {
      router.push(`/lesson/${resumeState.unitId}?step=${resumeState.step}&stepIndex=${resumeState.stepIndex}`);
    } else {
      router.push("/lesson/reading-people-unit-1");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Welcome & Profiler Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[13px] text-[#94A3B8] font-mono tracking-wide uppercase block">
            Dossier Active
          </span>
          <h1 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9] mt-0.5">
            Welcome back, {user?.displayName || "Pavan"}
          </h1>
        </div>

        {/* HUD Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip variant="cyan" className="text-[13px] font-bold">
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span>{user?.currentRank || "Rookie"}</span>
          </Chip>
          <Chip variant="amber" className="text-[13px]">
            <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
            <span>{user?.streak.current ?? 1} days streak</span>
          </Chip>
          <Chip variant="amber" className="text-[13px]">
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>{user?.totalXP ?? 0} XP</span>
          </Chip>
        </div>
      </div>

      {/* Review Due Banner */}
      {dueReviewCount > 0 && (
        <Card
          onClick={() => router.push("/review")}
          className="p-4 bg-gradient-to-r from-[#121826] to-[#1A2233] border-[#22D3EE]/50 hover:border-[#22D3EE] cursor-pointer flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/20 border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] flex-shrink-0">
              <span className="material-symbols-outlined text-[22px]">psychology</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[#F1F5F9]">
                  {dueReviewCount} Forensic {dueReviewCount === 1 ? "Cue" : "Cues"} Due for Review
                </span>
                <span className="bg-[#22D3EE] text-[#0B0F1A] text-[13px] font-mono font-bold px-1.5 py-0.2 rounded-full">
                  Due Now
                </span>
              </div>
              <span className="text-[13px] text-[#94A3B8]">
                Leitner spaced repetition queue ready.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[13px] font-mono text-[#22D3EE]">
            <span>Review</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </div>
        </Card>
      )}

      {/* HERO CARD: "Continue" / "Resume" across devices */}
      <Card className="relative overflow-hidden border-[#263047] bg-gradient-to-br from-[#121826] to-[#0F1422] p-5 md:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between text-[13px] text-[#94A3B8] font-mono mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#22D3EE] text-[18px]">
              visibility
            </span>
            <span className="text-[#22D3EE] font-semibold">
              {CURRENT_ACTIVE_LESSON.unitTitle}
            </span>
          </div>

          {resumeState ? (
            <div className="flex items-center gap-1 bg-[#1A2233] px-2.5 py-0.5 rounded-full border border-[#22D3EE]/40 text-[#22D3EE]">
              <span className="material-symbols-outlined text-[14px]">sync</span>
              <span>Synced ({resumeState.deviceName})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#1A2233] px-2.5 py-0.5 rounded-full border border-[#263047]">
              <span className="material-symbols-outlined text-[14px]">timer</span>
              <span>{CURRENT_ACTIVE_LESSON.estimatedMinutes} min</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 mb-5">
          <span className="text-[13px] font-mono text-[#94A3B8] tracking-wider uppercase">
            {resumeState ? "Ready to resume" : "Active Unit"}
          </span>
          <h2 className="font-headline text-[22px] md:text-[24px] font-bold text-[#F1F5F9]">
            {resumeState ? resumeState.previewLabel : CURRENT_ACTIVE_LESSON.title}
          </h2>
          <p className="text-[16px] text-[#94A3B8] leading-relaxed mt-1">
            {resumeState
              ? `Jump right back in where you left off on ${resumeState.deviceName}.`
              : CURRENT_ACTIVE_LESSON.description}
          </p>
        </div>

        {/* 56px Primary Action Button */}
        <Button
          variant="primary"
          onClick={handleResumeClick}
          className="gap-2.5"
        >
          <span className="material-symbols-outlined text-[22px]">play_arrow</span>
          <span>{resumeState ? "Resume lesson" : "Start lesson (8 min)"}</span>
        </Button>
      </Card>

      {/* Daily Challenge Card */}
      <DailyChallengeCard />

      {/* Today's Goal Ring Card & Streak Freeze */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Daily Goal Ring (2 cols) */}
        <Card className="sm:col-span-2 flex items-center justify-between p-5 bg-[#121826] border-[#263047]">
          <div className="flex items-center gap-4">
            <ProgressRing progress={goalProgress} size={64} strokeWidth={5} color="cyan">
              <span className="font-mono text-[14px] font-bold text-[#F1F5F9]">
                {goalProgress}%
              </span>
            </ProgressRing>

            <div className="flex flex-col">
              <span className="text-[13px] font-mono text-[#94A3B8] uppercase tracking-wider">
                Today&apos;s goal ({minutesGoal}m)
              </span>
              <span className="text-[17px] font-bold text-[#F1F5F9]">
                Daily learning target
              </span>
              <span className="text-[14px] text-[#94A3B8] mt-0.5">
                {minutesCompleted} of {minutesGoal} min completed today
              </span>
            </div>
          </div>

          <Link
            href="/onboarding"
            className="hidden sm:flex text-[13px] text-[#22D3EE] font-mono hover:underline items-center gap-1"
          >
            <span>Adjust</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </Card>

        {/* Streak Freeze Inventory Item */}
        <Card className="p-4 bg-[#121826] border-[#263047] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono text-[#22D3EE] uppercase tracking-wider">
              Streak Freeze
            </span>
            <span className="text-[20px]">❄️</span>
          </div>

          <div className="my-2">
            <span className="text-[20px] font-bold font-mono text-[#F1F5F9] block">
              {freezeTokens} Available
            </span>
            <span className="text-[13px] text-[#94A3B8] leading-tight block mt-0.5">
              Protects streak on missed days
            </span>
          </div>

          <button
            type="button"
            disabled={freezeTokens <= 0}
            onClick={handleUseFreeze}
            className="w-full py-1.5 px-2 rounded-lg bg-[#1A2233] border border-[#263047] hover:border-[#22D3EE]/40 text-[13px] font-mono text-[#22D3EE] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {freezeTokens > 0 ? "Use freeze token" : "No freeze left"}
          </button>
        </Card>
      </div>

      {/* Learning Paths List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[20px] font-bold text-[#F1F5F9]">
              Learning paths
            </h2>
            <span className="bg-[#1A2233] text-[#94A3B8] border border-[#263047] text-[13px] font-mono px-2 py-0.5 rounded-full">
              {INITIAL_PATHS.length} paths
            </span>
          </div>
          <Link
            href="/paths"
            className="text-[14px] text-[#22D3EE] font-medium hover:underline flex items-center"
          >
            <span>View all</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {INITIAL_PATHS.map((path) => (
            <Link
              key={path.id}
              href={`/paths/${path.id}`}
              className="flex items-center justify-between p-4 rounded-xl bg-[#121826] border border-[#263047] hover:border-[#22D3EE]/40 transition-all duration-150 cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-[#1A2233] flex items-center justify-center text-[#22D3EE] group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="material-symbols-outlined text-[22px]">
                    {path.icon}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold text-[#F1F5F9] group-hover:text-[#22D3EE] transition-colors">
                      {path.title}
                    </span>
                    <span className="text-[13px] text-[#94A3B8] font-mono">
                      0%
                    </span>
                  </div>
                  <span className="text-[14px] text-[#94A3B8] line-clamp-1">
                    {path.description}
                  </span>
                </div>
              </div>

              <span className="material-symbols-outlined text-[#94A3B8] group-hover:text-[#22D3EE] group-hover:translate-x-0.5 transition-all">
                chevron_right
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
