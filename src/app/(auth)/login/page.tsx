"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { signInGoogle, signInGuest } = useAuthStore();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    try {
      setErrorMsg(null);
      setLoadingGoogle(true);
      await signInGoogle();
      router.push("/onboarding");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Sign in was cancelled or failed. Please try again.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGuestAuth = async () => {
    try {
      setErrorMsg(null);
      setLoadingGuest(true);
      await signInGuest();
      router.push("/onboarding");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Guest sign-in failed. Please try again.");
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-between w-full min-h-screen bg-[#0B0F1A] text-[#F1F5F9] pt-safe pb-safe px-5 py-8 relative overflow-hidden">
      {/* Ambient Atmospheric Radar Radial Backdrop */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#22D3EE]/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top spacer */}
      <div className="w-full h-8" />

      {/* Center Brand Identity */}
      <div className="w-full max-w-[420px] mx-auto flex flex-col items-center text-center my-auto">
        {/* Aperture / Fingerprint Logo */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-[#22D3EE]/25 blur-lg scale-110" />
          <div className="relative w-28 h-28 rounded-full bg-[#070A12] p-1 flex items-center justify-center border border-[#263047] shadow-xl shadow-[#22D3EE]/15">
            {/* SVG Precision Aperture / Dial Rings */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-[#263047]"
                cx="50"
                cy="50"
                fill="none"
                opacity="0.6"
                r="45"
                stroke="currentColor"
                strokeDasharray="3 4"
                strokeWidth="1.5"
              />
              <circle
                className="text-[#22D3EE]"
                cx="50"
                cy="50"
                fill="none"
                r="45"
                stroke="currentColor"
                strokeDasharray="140 180"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </svg>
            {/* Inner Aperture Core */}
            <div className="w-18 h-18 rounded-full bg-[#121826] flex items-center justify-center border border-[#22D3EE]/30 relative z-10 p-3">
              <span className="material-symbols-outlined text-[#22D3EE] text-4xl select-none">
                fingerprint
              </span>
            </div>
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="font-headline text-[34px] font-bold text-[#F1F5F9] tracking-wider uppercase">
          DECODE
        </h1>

        {/* Brand Tagline */}
        <p className="text-[18px] leading-[26px] text-[#94A3B8] mt-2 max-w-xs font-medium">
          Read people. Think clearly. Build wealth.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-[#93000A]/30 border border-[#F87171]/40 text-[#F87171] text-[13px]">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Bottom Actions Section */}
      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-3 mt-8">
        {/* Continue with Google */}
        <Button
          variant="google"
          onClick={handleGoogleAuth}
          isLoading={loadingGoogle}
          id="btn-google-auth"
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
          <span>Continue with Google</span>
        </Button>

        {/* Continue as Guest */}
        <Button
          variant="outline"
          onClick={handleGuestAuth}
          isLoading={loadingGuest}
          id="btn-guest-auth"
        >
          <span>Continue as guest</span>
        </Button>

        {/* Sync Disclaimer */}
        <p className="text-[13px] leading-5 text-[#94A3B8] text-center mt-2 font-mono">
          Your progress syncs across your phone and laptop.
        </p>
      </div>
    </main>
  );
}
