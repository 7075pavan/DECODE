"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { getDeviceInfo, getLastSyncTime } from "@/lib/sync/syncEngine";
import { formatFirebaseAuthError } from "@/lib/firebase/auth";

export default function SettingsPage() {
  const router = useRouter();
  const { user, linkToGoogle, handleRedirectAuth, setDailyGoal, signOut } = useAuthStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [device, setDevice] = useState({ deviceId: "loading...", deviceName: "Mac / Laptop" });
  const [lastSync, setLastSync] = useState("Just now");
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setDevice(getDeviceInfo());
    setLastSync(getLastSyncTime());

    handleRedirectAuth()
      .then((profile) => {
        if (profile) {
          setSuccessMessage("Account successfully linked with Google! Your progress is permanently secured.");
        }
      })
      .catch((err) => {
        const formatted = formatFirebaseAuthError(err);
        setErrorMessage(`[${formatted.code}] ${formatted.message}`);
      });

    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const onOn = () => setIsOnline(true);
      const onOff = () => setIsOnline(false);
      window.addEventListener("online", onOn);
      window.addEventListener("offline", onOff);

      const savedSound = localStorage.getItem("decode_sound_enabled");
      if (savedSound !== null) setSoundEnabled(savedSound === "true");

      const savedHaptics = localStorage.getItem("decode_haptics_enabled");
      if (savedHaptics !== null) setHapticsEnabled(savedHaptics === "true");

      return () => {
        window.removeEventListener("online", onOn);
        window.removeEventListener("offline", onOff);
      };
    }
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("decode_sound_enabled", String(next));
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem("decode_haptics_enabled", String(next));
  };

  const handleLinkGoogle = async () => {
    setErrorMessage(null);
    try {
      const res = await linkToGoogle((reason) => {
        console.log("[auth] Settings linking fallback notice:", reason);
      });
      if (res === "REDIRECT_STARTED") {
        return;
      }
      setSuccessMessage("Account successfully linked with Google! Your progress is permanently secured.");
    } catch (err: any) {
      console.error("[auth] Settings account linking failed:", err);
      const formatted = formatFirebaseAuthError(err);
      setErrorMessage(`[${formatted.code}] ${formatted.message}`);
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      user,
      device,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `decode-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage("Telemetry backup downloaded successfully.");
  };

  const handleClearCache = () => {
    if (confirm("Clear local cache? Your account data on Firestore will remain safe.")) {
      localStorage.removeItem("decode_active_resume");
      setSuccessMessage("Local offline cache cleared.");
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-[14px] text-[#94A3B8]">
        <Link
          href="/profile"
          className="hover:text-[#22D3EE] transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Profile</span>
        </Link>
        <span>/</span>
        <span className="text-[#F1F5F9] font-medium">Settings</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-[26px] md:text-[30px] font-bold text-[#F1F5F9]">
          Settings & Preferences
        </h1>
        <p className="text-[14px] text-[#94A3B8]">
          Manage audio, haptics, daily goals, device sync, and account credentials.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-[14px]">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-[14px]">
          {errorMessage}
        </div>
      )}

      {/* Daily Goal Configuration */}
      <Card className="p-5 bg-[#121826] border-[#263047] flex flex-col gap-3">
        <div>
          <h2 className="font-headline text-[16px] font-bold text-[#F1F5F9]">
            Daily Goal Target
          </h2>
          <span className="text-[13px] text-[#94A3B8]">
            Determines your daily goal progress ring on Home.
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mt-1">
          {[5, 10, 15].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => {
                setDailyGoal(mins as 5 | 10 | 15);
                setSuccessMessage(`Daily goal updated to ${mins} minutes.`);
              }}
              className={`p-3 rounded-xl border text-center transition-all ${
                user?.dailyGoalMinutes === mins
                  ? "bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE] font-bold shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                  : "bg-[#1A2233] border-[#263047] text-[#94A3B8] hover:text-white"
              }`}
            >
              <span className="font-mono text-[16px] block">{mins} min</span>
              <span className="text-[13px] font-mono text-[#94A3B8] block mt-0.5">
                {mins === 5 ? "Casual" : mins === 10 ? "Standard" : "Intense"}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Audio & Haptic Sensory Controls */}
      <Card className="p-5 bg-[#121826] border-[#263047] flex flex-col gap-4">
        <div>
          <h2 className="font-headline text-[16px] font-bold text-[#F1F5F9]">
            Audio & Sensory Feedback
          </h2>
          <span className="text-[13px] text-[#94A3B8]">
            Subtle auditory and kinetic cues during quiz deductions and level-ups.
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A2233] border border-[#263047]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#22D3EE]">
                volume_up
              </span>
              <div>
                <span className="text-[14px] font-bold text-[#F1F5F9] block">
                  Sound Effects
                </span>
                <span className="text-[13px] text-[#94A3B8]">
                  Play subtle biometric clicks and confirmation tones.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                soundEnabled ? "bg-[#22D3EE]" : "bg-[#263047]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-[#0B0F1A] absolute top-0.5 transition-transform ${
                  soundEnabled ? "left-6.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A2233] border border-[#263047]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px] text-[#22D3EE]">
                vibration
              </span>
              <div>
                <span className="text-[14px] font-bold text-[#F1F5F9] block">
                  Haptic Feedback
                </span>
                <span className="text-[13px] text-[#94A3B8]">
                  Trigger micro-vibrations on slider adjustments and button taps.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleHaptics}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                hapticsEnabled ? "bg-[#22D3EE]" : "bg-[#263047]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-[#0B0F1A] absolute top-0.5 transition-transform ${
                  hapticsEnabled ? "left-6.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Cross-Device Synchronization Telemetry */}
      <Card className="p-5 bg-[#121826] border-[#263047] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-[16px] font-bold text-[#F1F5F9]">
              Cross-Device Synchronization
            </h2>
            <span className="text-[13px] text-[#94A3B8]">
              Continuous step-by-step state replication across your devices.
            </span>
          </div>

          <Chip variant={isOnline ? "cyan" : "coral"} size="sm">
            {isOnline ? "Cloud Online" : "Offline Storage"}
          </Chip>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] font-mono">
          <div className="p-3 rounded-xl bg-[#1A2233] border border-[#263047]">
            <span className="text-[#94A3B8] block text-[13px]">ACTIVE DEVICE</span>
            <span className="text-[#F1F5F9] font-bold mt-0.5 block">
              {device.deviceName}
            </span>
            <span className="text-[#64748B] text-[13px] break-all block">
              ID: {device.deviceId}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#1A2233] border border-[#263047]">
            <span className="text-[#94A3B8] block text-[13px]">LAST SYNC STATUS</span>
            <span className="text-[#22D3EE] font-bold mt-0.5 block">
              {lastSync}
            </span>
            <span className="text-[#64748B] text-[13px] block">
              Protocol: Firestore onSnapshot
            </span>
          </div>
        </div>
      </Card>

      {/* Data & Storage Management */}
      <Card className="p-5 bg-[#121826] border-[#263047] flex flex-col gap-3">
        <div>
          <h2 className="font-headline text-[16px] font-bold text-[#F1F5F9]">
            Data & Privacy
          </h2>
          <span className="text-[13px] text-[#94A3B8]">
            Full sovereignty over your learner telemetry and offline storage.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-1">
          <Button
            variant="secondary"
            className="w-full sm:w-auto flex-1 gap-2"
            onClick={handleExportData}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Telemetry (JSON)</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full sm:w-auto flex-1 gap-2 text-[#EF4444] hover:border-[#EF4444]"
            onClick={handleClearCache}
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span>Clear Local Cache</span>
          </Button>
        </div>
      </Card>

      {/* Account Security & Authentication */}
      <Card className="p-5 bg-[#121826] border-[#263047] flex flex-col gap-4">
        <div>
          <h2 className="font-headline text-[16px] font-bold text-[#F1F5F9]">
            Account Security
          </h2>
          <span className="text-[13px] text-[#94A3B8]">
            Manage authentication status and identity provider linking.
          </span>
        </div>

        {user?.isAnonymous ? (
          <div className="p-4 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#22D3EE]">
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <strong className="text-[14px]">Guest Account Active</strong>
            </div>
            <p className="text-[13px] text-[#94A3B8] leading-relaxed">
              Link your guest session to Google to safeguard your XP, streak, and completed units across mobile and laptop permanently.
            </p>
            <Button
              variant="primary"
              className="mt-1 h-12"
              onClick={handleLinkGoogle}
            >
              Link to Google Account
            </Button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#1A2233] border border-[#263047] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#10B981] text-[20px]">
                verified_user
              </span>
              <div>
                <span className="text-[14px] font-bold text-[#F1F5F9] block">
                  Google Account Connected
                </span>
                <span className="text-[13px] font-mono text-[#94A3B8]">
                  {user?.email}
                </span>
              </div>
            </div>
            <Chip variant="default" size="sm">
              Secured
            </Chip>
          </div>
        )}

        <Button
          variant="secondary"
          className="w-full text-[#EF4444] border-[#EF4444]/30 hover:border-[#EF4444] hover:bg-[#EF4444]/10 h-12"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out</span>
        </Button>
      </Card>
    </div>
  );
}
