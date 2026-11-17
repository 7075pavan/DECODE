"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getRankInfo } from "@/lib/scoring/scoringEngine";
import { SkillRadarChart } from "@/components/profile/SkillRadarChart";
import { CalibrationChart } from "@/components/profile/CalibrationChart";
import { BadgesGallery } from "@/components/profile/BadgesGallery";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const rankInfo = getRankInfo(user?.totalXP || 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9]">
            Learner Dossier
          </h1>
          <p className="text-[14px] text-[#94A3B8]">
            Cognitive metrics, skill radar, calibration telemetry, and badges.
          </p>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A2233] border border-[#263047] text-[#F1F5F9] text-[13px] font-mono hover:border-[#22D3EE] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px] text-[#22D3EE]">
            settings
          </span>
          <span>Settings</span>
        </Link>
      </div>

      {/* User Rank & XP Dossier Card */}
      <Card className="flex flex-col p-6 bg-[#121826] border-[#263047] gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A2233] border border-[#263047] flex items-center justify-center text-[#22D3EE] font-headline font-bold text-[24px] flex-shrink-0">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : "PA"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-[20px] font-bold text-[#F1F5F9]">
                  {user?.displayName || "Pavan"}
                </h2>
                {user?.isAnonymous && (
                  <Chip variant="default" size="sm">
                    Guest Dossier
                  </Chip>
                )}
              </div>
              <span className="text-[13px] text-[#94A3B8] font-mono">
                {user?.email || "Local Guest Mode"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip variant="cyan" size="md" className="font-bold">
              <span className="material-symbols-outlined text-[18px]">shield</span>
              <span>{rankInfo.currentRank}</span>
            </Chip>
            <Chip variant="amber" size="md">
              <span className="material-symbols-outlined text-[18px]">
                local_fire_department
              </span>
              <span>{user?.streak.current ?? 1} Days</span>
            </Chip>
          </div>
        </div>

        {/* Rank Progression */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#263047]">
          <div className="flex items-center justify-between text-[13px] font-mono">
            <span className="text-[#94A3B8]">
              XP: <strong className="text-[#F1F5F9]">{user?.totalXP || 0}</strong>
            </span>
            {rankInfo.nextRank ? (
              <span className="text-[#22D3EE]">
                {rankInfo.nextRankXP ? rankInfo.nextRankXP - (user?.totalXP || 0) : 0} XP to {rankInfo.nextRank}
              </span>
            ) : (
              <span className="text-[#F59E0B] font-bold">Max Rank Attained</span>
            )}
          </div>
          <ProgressBar progress={rankInfo.progressPercent} color="cyan" />
        </div>
      </Card>

      {/* 5-Path Skill Radar Chart */}
      <SkillRadarChart
        completedUnits={user?.completedUnits || []}
        totalXP={user?.totalXP || 0}
      />

      {/* Metacognitive Calibration Curve */}
      <CalibrationChart />

      {/* Badges Gallery */}
      <BadgesGallery earnedBadges={user?.earnedBadges || []} />
    </div>
  );
}
