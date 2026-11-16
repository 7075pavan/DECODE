"use client";

import { useEffect, useState } from "react";

export function PWARegister() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // Monitor Online/Offline Status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#1A2233] border-b border-[#22D3EE]/50 px-4 py-2 flex items-center justify-center gap-2 text-[13px] font-mono text-[#22D3EE] shadow-lg animate-fadeIn">
      <span className="material-symbols-outlined text-[18px]">cloud_off</span>
      <span>Offline mode active. Progress is saved locally and will sync automatically when reconnected.</span>
    </div>
  );
}
