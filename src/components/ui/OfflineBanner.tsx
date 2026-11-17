"use client";

import React, { useState, useEffect } from "react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#1A2233] border-b border-[#22D3EE]/50 px-4 py-2.5 flex items-center justify-center gap-2.5 text-[#22D3EE] text-[13px] font-mono shadow-lg transition-all animate-in slide-in-from-top z-50 sticky top-0"
    >
      <span className="material-symbols-outlined text-[18px] animate-pulse">
        cloud_off
      </span>
      <span>
        <strong>Offline mode:</strong> Progress and answers are cached locally and will auto-sync on reconnect.
      </span>
    </div>
  );
}
