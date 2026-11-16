"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getRankInfo } from "@/lib/scoring/scoringEngine";
import { getDeviceInfo, getLastSyncTime } from "@/lib/sync/syncEngine";

export default function ProfilePage() {
  const router = useRouter();
  const { user, linkToGoogle, setDailyGoal, signOut, isLoading } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [device, setDevice] = useState<{ deviceId: string; deviceName: string }>({
    deviceId: "loading...",
    deviceName: "Laptop / Desktop",
  });
  const [lastSync, setLastSync] = useState("Just now");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setDevice(getDeviceInfo());
    setLastSync(getLastSyncTime());

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const onOn = () => setIsOnline(true);
      const onOff = () => setIsOnline(false);
      window.addEventListener("online", onOn);
      window.addEventListener("offline", onOff);
      return () => {
        window.removeEventListener("online", onOn);
        window.removeEventListener("offline", onOff);
      };
    }
  }, []);

  const rankInfo = getRankInfo(user?.totalXP || 0);

  const handleLink = async () => {
    try {
      setErrorMessage(null);
      await linkToGoogle();
      setSuccessMessage("Account successfully linked with Google! Your progress is now safely backed up.");
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Account linking failed or was cancelled.");
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9]">
          Profiler dossier
        </h1>
        <p className="text-[15px] text-[#94A3B8]">
          Identity, telemetry, and cross-device synchronization.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-[#34D399]/15 border border-[#34D399]/40 text-[#34D399] text-[14px]">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#F87171]/15 border border-[#F87171]/40 text-[#F87171] text-[14px]">
          {errorMessage}
        </div>
      )}

      {/* Offline Alert Banner if offline */}
      {!isOnline && (
        <div className="p-4 rounded-xl bg-[#1A2233] border border-[#22D3EE]/50 flex items-center gap-3 text-[14px] text-[#22D3EE]">
          <span className="material-symbols-outlined text-[22px]">cloud_off</span>
          <div>
            <strong className="block font-semibold">Offline Mode Active</strong>
            <span className="text-[#94A3B8] text-[13px]">
              All lesson answers and progress are saved in local IndexedDB. Changes will automatically sync to your other devices on reconnect.
            </span>
          </div>
        </div>
      )}

      {/* User Profile Card */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#121826] border-[#263047]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1A2233] border border-[#263047] flex items-center justify-center text-[#22D3EE] font-headline font-bold text-[22px] flex-shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-bold text-[#F1F5F9]">
                {user?.displayName || "Pavan"}
              </h2>
              {user?.isAnonymous && (
                <Chip variant="default" size="sm">
                  Guest
                </Chip>
              )}
            </div>
            <span className="text-[14px] text-[#94A3B8]">
              {user?.email || "Local Guest Session"}
            </span>
            <span className="text-[13px] text-[#22D3EE] font-mono mt-0.5">
              Rank: {rankInfo.currentRank}
            </span>
          </div>
        </div>

        {/* Telemetry counters */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center bg-[#1A2233] px-3.5 py-2 rounded-xl border border-[#263047]">
            <span className="text-[18px] font-bold text-[#F59E0B] font-mono leading-tight">
              {user?.streak.current ?? 1}
            </span>
            <span className="text-[13px] text-[#94A3B8] font-mono">Streak</span>
          </div>
          <div className="flex flex-col items-center bg-[#1A2233] px-3.5 py-2 rounded-xl border border-[#263047]">
            <span className="text-[18px] font-bold text-[#F59E0B] font-mono leading-tight">
              {user?.totalXP ?? 0}
            </span>
            <span className="text-[13px] text-[#94A3B8] font-mono">XP</span>
          </div>
        </div>
      </Card>

      {/* Rank Progress Bar */}
      <Card className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">
              military_tech
            </span>
            <span className="text-[15px] font-semibold text-[#F1F5F9]">
              Rank Tier: {rankInfo.currentRank}
            </span>
          </div>
          <span className="text-[13px] font-mono text-[#94A3B8]">
            {rankInfo.nextRank ? `${rankInfo.nextRankXP! - (user?.totalXP || 0)} XP to ${rankInfo.nextRank}` : "Maximum Rank Reached"}
          </span>
        </div>

        <ProgressBar progress={rankInfo.progressPercent} color="amber" height="h-2" />
      </Card>

      {/* Cross-Device Synchronization Card */}
      <Card className="p-5 flex flex-col gap-4 border-[#263047]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#22D3EE] text-[22px]">
              sync
            </span>
            <h3 className="font-headline text-[18px] font-semibold text-[#F1F5F9]">
              Synced across devices
            </h3>
          </div>
          <Chip variant={isOnline ? "cyan" : "coral"} size="sm">
            {isOnline ? "Cloud Connected" : "Offline"}
          </Chip>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] font-mono">
          <div className="p-3 rounded-xl bg-[#1A2233] border border-[#263047] flex flex-col">
            <span className="text-[#94A3B8]">Last Sync Timestamp</span>
            <span className="text-[#F1F5F9] font-bold text-[14px] mt-0.5">
              {lastSync}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#1A2233] border border-[#263047] flex flex-col">
            <span className="text-[#94A3B8]">Registered Device</span>
            <span className="text-[#22D3EE] font-bold text-[14px] mt-0.5 truncate">
              {device.deviceName}
            </span>
          </div>
        </div>

        {user?.isAnonymous ? (
          <div className="flex flex-col gap-3 pt-1">
            <p className="text-[14px] text-[#94A3B8] leading-relaxed">
              You are currently using DECODE in guest mode on {device.deviceName}. Link your Google account to automatically sync your streaks, XP, and lesson progress across your phone and laptop without losing any progress.
            </p>
            <Button
              variant="google"
              onClick={handleLink}
              isLoading={isLoading}
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Link with Google</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#1A2233] border border-[#34D399]/40">
            <span className="material-symbols-outlined text-[#34D399] text-[22px]">
              cloud_done
            </span>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-[#F1F5F9]">
                Google Account Linked: {user?.email}
              </span>
              <span className="text-[13px] text-[#94A3B8]">
                Real-time bidirectional sync active with conflict protection.
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Daily Goal Settings */}
      <Card className="p-5 flex flex-col gap-3">
        <h3 className="font-headline text-[18px] font-semibold text-[#F1F5F9]">
          Daily learning goal
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {([5, 10, 15] as const).map((mins) => {
            const isSelected = (user?.dailyGoalMinutes || 10) === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => setDailyGoal(mins)}
                className={`py-3 rounded-xl border text-[14px] font-mono font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#1A2233] border-[#22D3EE] text-[#22D3EE] shadow-sm shadow-[#22D3EE]/20"
                    : "bg-[#121826] border-[#263047] text-[#94A3B8] hover:border-[#22D3EE]/40"
                }`}
              >
                {mins} min/day
              </button>
            );
          })}
        </div>
      </Card>

      {/* Sign Out Button */}
      <div className="mt-2">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-[#93000A]/40 text-[#F87171] hover:bg-[#93000A]/10"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
