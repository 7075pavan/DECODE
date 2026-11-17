"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/Button";
import { formatFirebaseAuthError, FormattedAuthError } from "@/lib/firebase/auth";
import {
  auth,
  firebaseConfigStatus,
  getAuthDomain,
  isSafariBrowser,
  ensureAuthPersistence,
} from "@/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();
  const { signInGoogle, signInGuest, handleRedirectAuth, isOnboarded } = useAuthStore();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);
  const [authError, setAuthError] = useState<FormattedAuthError | null>(null);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Diagnostics state for ?debug=1
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    hostname: "",
    authDomain: "",
    isSafari: false,
    userAgent: "",
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check URL query parameters and initialize persistence on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("debug") === "1") {
        setShowDebug(true);
        setDebugInfo({
          hostname: window.location.hostname,
          authDomain: getAuthDomain(),
          isSafari: isSafariBrowser(),
          userAgent: navigator.userAgent,
        });
      }

      // Establish local persistence proactively on client mount
      ensureAuthPersistence(auth);
    }
  }, []);

  // Check for redirect result on mount (essential for Safari/Mobile when redirect was used)
  useEffect(() => {
    let isMounted = true;

    async function checkRedirect() {
      console.log("[auth] Checking getRedirectResult on page load...");
      try {
        const profile = await handleRedirectAuth();
        console.log("[auth] getRedirectResult check completed. Profile:", profile ? profile.uid : "null");

        if (profile && isMounted) {
          console.log("[auth] Authenticated via redirect. Navigating...");
          router.replace(isOnboarded ? "/home" : "/onboarding");
          return;
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("[auth] Redirect resolution failed on page load:", err);
          const formatted = formatFirebaseAuthError(err);
          setAuthError(formatted);
        }
      } finally {
        if (isMounted) {
          setIsProcessingRedirect(false);
        }
      }
    }

    checkRedirect();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleRedirectAuth, isOnboarded, router]);

  const handleGoogleAuth = async () => {
    // DO NOT await anything before calling signInGoogle!
    // Safari will block the popup if any microtask/await precedes window.open.
    setAuthError(null);
    setRedirectNotice(null);
    setLoadingGoogle(true);

    let isRedirecting = false;
    let didTimeout = false;

    // 25-second timeout: resets loading state and alerts user if sign-in hangs
    timeoutRef.current = setTimeout(() => {
      didTimeout = true;
      console.error("[auth] Sign-in 25-second timeout triggered without completion");
      setLoadingGoogle(false);
      setRedirectNotice(null);
      setAuthError({
        code: "auth/timeout",
        message: "Sign-in did not finish. Try again, or use Chrome.",
        rawMessage: "Authentication timed out after 25 seconds.",
      });
    }, 25000);

    try {
      console.log("[auth] Continue with Google tapped - calling popup directly...");
      const result = await signInGoogle((reason) => {
        console.log("[auth] Fallback to redirect notice:", reason);
        setRedirectNotice(reason);
      });

      if (didTimeout) return;

      if (result === "REDIRECT_STARTED") {
        console.log("[auth] Redirect flow initiated; waiting for browser to leave page...");
        isRedirecting = true;
        // Keep loading state until navigation, but timeout protects against hang
        return;
      }

      console.log("[auth] Google sign-in finished successfully via popup.");
      router.push(isOnboarded ? "/home" : "/onboarding");
    } catch (err: any) {
      if (!didTimeout) {
        console.error("[auth] Google authentication error caught:", err);
        const formatted = formatFirebaseAuthError(err);
        setAuthError(formatted);
      }
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Always reset loading unless redirect is actively in flight
      if (!isRedirecting || didTimeout) {
        setLoadingGoogle(false);
      }
    }
  };

  const handleGuestAuth = async () => {
    setAuthError(null);
    setRedirectNotice(null);
    setLoadingGuest(true);

    try {
      console.log("[auth] Continue as guest tapped");
      await signInGuest();
      console.log("[auth] Guest session initialized");
      router.push("/onboarding");
    } catch (err: any) {
      console.error("[auth] Guest login failed:", err);
      const formatted = formatFirebaseAuthError(err);
      setAuthError(formatted);
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
      <div className="w-full max-w-[440px] mx-auto flex flex-col items-center text-center my-auto">
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

        {/* Diagnostics / Sign-in debug (visible with ?debug=1) */}
        {showDebug && (
          <div className="mt-4 p-3 rounded-xl bg-[#070A12] border border-[#22D3EE]/40 text-[12px] font-mono text-[#94A3B8] text-left w-full flex flex-col gap-1.5 animate-fadeIn">
            <div className="text-[#22D3EE] font-bold text-[13px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">bug_report</span>
              <span>Sign-in debug (?debug=1)</span>
            </div>
            <div>Hostname: <span className="text-[#F1F5F9] font-bold">{debugInfo.hostname || "local"}</span></div>
            <div>authDomain in use: <span className="text-[#22D3EE] font-bold">{debugInfo.authDomain}</span></div>
            <div>Last auth error code: <span className="text-[#F87171] font-bold">{authError?.code || "None"}</span></div>
          </div>
        )}

        {/* Redirect In-flight fallback notice */}
        {redirectNotice && (
          <div className="mt-4 p-3 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE] text-[13px] text-left w-full flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-current border-t-transparent animate-spin flex-shrink-0" />
            <span>{redirectNotice}</span>
          </div>
        )}

        {/* Firebase Config Missing Warning */}
        {!firebaseConfigStatus.isConfigured && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] text-[13px] text-left w-full flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Firebase Incomplete Setup</span>
            </div>
            <p className="text-[13px] leading-relaxed text-[#FDE68A]">
              Missing environment variables:{" "}
              <code className="text-[#F59E0B] font-mono break-all font-semibold">
                {firebaseConfigStatus.missingVariables.join(", ")}
              </code>
            </p>
          </div>
        )}

        {/* Auth Error Display: exact Firebase error code + friendly message */}
        {authError && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#93000A]/30 border border-[#F87171]/50 text-[#F87171] text-[13px] text-left w-full flex flex-col gap-1.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 font-mono font-bold text-[#FCA5A5]">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>[{authError.code}]</span>
            </div>
            <p className="text-[13px] leading-relaxed text-[#FEE2E2]">
              {authError.message}
            </p>
            {authError.code === "auth/unauthorized-domain" && typeof window !== "undefined" && (
              <div className="mt-1 p-2 rounded bg-[#0B0F1A]/80 border border-[#F87171]/30 font-mono text-[12px] text-[#CBD5E1]">
                Authorized domain needed:{" "}
                <span className="text-[#22D3EE] font-bold select-all">
                  {window.location.hostname}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Redirecting In-flight Indicator */}
        {isProcessingRedirect && (
          <div className="mt-3 flex items-center gap-2 text-[13px] font-mono text-[#22D3EE]">
            <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
            <span>Verifying session state...</span>
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
