"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getUnitData } from "@/content/registry";
import { UnitOverview } from "@/components/lesson/UnitOverview";
import { LearnStep } from "@/components/lesson/LearnStep";
import { SeeStep } from "@/components/lesson/SeeStep";
import { TryStep } from "@/components/lesson/TryStep";
import { ProveStep } from "@/components/lesson/ProveStep";
import { ApplyStep } from "@/components/lesson/ApplyStep";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { SessionStats } from "@/components/lesson/LessonSummary";
import { saveStepProgress, getStoredResumeState } from "@/lib/sync/syncEngine";

type Stage = "overview" | "learn" | "see" | "try" | "prove" | "apply";

export default function LessonUnitPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, addXP, logDailyMinutes } = useAuthStore();

  const unitId = (params?.unitId as string) || "reading-people-unit-1";
  const unitData = getUnitData(unitId);

  const [currentStage, setCurrentStage] = useState<Stage>("overview");

  // Resume state on initial load: URL query params take precedence, then stored sync state
  useEffect(() => {
    const urlStep = searchParams?.get("step") as Stage;
    if (urlStep && ["overview", "learn", "see", "try", "prove", "apply"].includes(urlStep)) {
      setCurrentStage(urlStep);
      return;
    }

    const stored = getStoredResumeState();
    if (stored && stored.unitId === unitId) {
      setCurrentStage(stored.step);
    }
  }, [searchParams, unitId]);

  const handleExit = () => {
    router.push(`/paths/${unitData.pathId || "reading-people"}`);
  };

  const handleStartLearn = () => {
    setCurrentStage("learn");
    if (user?.uid) {
      saveStepProgress({
        userId: user.uid,
        unitId: unitId,
        step: "learn",
        stepIndex: 1,
        previewLabel: `Step 1 of 6 · Core Concept Dossier`,
        totalXP: user.totalXP,
        streak: user.streak.current,
      });
    }
  };

  const handleLearnComplete = () => {
    setCurrentStage("see");
    if (user?.uid) {
      saveStepProgress({
        userId: user.uid,
        unitId: unitId,
        step: "see",
        stepIndex: 2,
        previewLabel: `Step 2 of 6 · ${unitData.title} Worked Example`,
        totalXP: user.totalXP,
        streak: user.streak.current,
      });
    }
  };

  const handleSeeComplete = () => {
    setCurrentStage("try");
    if (user?.uid) {
      saveStepProgress({
        userId: user.uid,
        unitId: unitId,
        step: "try",
        stepIndex: 1,
        scenarioIndex: 0,
        previewLabel: "Step 3 of 6 · Practice Cases",
        totalXP: user.totalXP,
        streak: user.streak.current,
      });
    }
  };

  const handleTryComplete = (stats: SessionStats) => {
    if (stats.totalXPEarned > 0) {
      addXP(stats.totalXPEarned);
    }
    logDailyMinutes(4);
    setCurrentStage("prove");

    if (user?.uid) {
      saveStepProgress({
        userId: user.uid,
        unitId: unitId,
        step: "prove",
        stepIndex: 1,
        previewLabel: `Step 5 of 6 · 8-Question Mastery Check`,
        xpEarnedDelta: stats.totalXPEarned,
        totalXP: user.totalXP + stats.totalXPEarned,
        streak: user.streak.current,
      });
    }
  };

  const handleProvePass = (score: number) => {
    addXP(20);
    logDailyMinutes(2);
    setCurrentStage("apply");

    if (user?.uid) {
      saveStepProgress({
        userId: user.uid,
        unitId: unitId,
        step: "apply",
        stepIndex: 6,
        previewLabel: `Step 6 of 6 · Real-World Field Mission`,
        totalXP: user.totalXP + 20,
        streak: user.streak.current,
        badgeAwarded: {
          id: `badge-${unitId}`,
          title: `${unitData.title} Mastery Badge`,
          icon: "military_tech",
        },
      });
    }
  };

  const handleApplyFinish = (reflectionText: string) => {
    logDailyMinutes(2);
    if (user?.uid) {
      saveStepProgress({
        userId: user.uid,
        unitId: unitId,
        step: "apply",
        stepIndex: 6,
        previewLabel: `${unitData.title} Completed`,
        missionReflection: reflectionText,
        totalXP: user.totalXP + (unitData.xpReward || 60),
        streak: (user.streak.current || 1) + 1,
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-[#F1F5F9] flex flex-col pt-safe pb-safe px-4 md:px-8">
      {/* Level-Up Modal */}
      <LevelUpModal />

      {/* Top Bar for Stages > overview */}
      {currentStage !== "overview" && (
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between py-2 border-b border-[#263047] mb-2">
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1.5 text-[14px] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer py-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span className="hidden sm:inline">Exit lesson</span>
          </button>
          <span className="font-mono text-[13px] text-[#22D3EE] font-semibold text-center">
            {unitData.title}
          </span>
          <div className="w-10" />
        </div>
      )}

      {/* STAGE CONTROLLER */}
      <div className="flex-1 flex flex-col justify-center">
        {currentStage === "overview" && (
          <UnitOverview
            unitData={unitData}
            onStart={handleStartLearn}
          />
        )}

        {currentStage === "learn" && (
          <LearnStep
            learnData={unitData.learn}
            onComplete={handleLearnComplete}
          />
        )}

        {currentStage === "see" && (
          <SeeStep
            seeData={unitData.see}
            onComplete={handleSeeComplete}
          />
        )}

        {currentStage === "try" && (
          <TryStep
            tryData={unitData.try}
            onComplete={handleTryComplete}
            onExit={handleExit}
          />
        )}

        {currentStage === "prove" && (
          <ProveStep
            proveData={unitData.prove}
            onPass={handleProvePass}
            onExit={handleExit}
          />
        )}

        {currentStage === "apply" && (
          <ApplyStep
            applyData={unitData.apply}
            unitTitle={unitData.title}
            onFinishUnit={handleApplyFinish}
          />
        )}
      </div>
    </main>
  );
}
