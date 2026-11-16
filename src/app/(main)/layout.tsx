"use client";

import React from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TabBar } from "@/components/navigation/TabBar";
import { LevelUpModal } from "@/components/ui/LevelUpModal";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F1F5F9] flex flex-col">
      {/* Level Up Promotional Animation Modal */}
      <LevelUpModal />

      {/* Desktop / Laptop Left Sidebar */}
      <Sidebar />

      {/* Mobile Top Header (Minimalist HUD) */}
      <header className="md:hidden flex items-center justify-between px-5 py-3.5 border-b border-[#263047] bg-[#0B0F1A]/90 backdrop-blur-md sticky top-0 z-30 pt-safe">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#121826] border border-[#263047] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#22D3EE] text-[18px]">
              fingerprint
            </span>
          </div>
          <span className="font-headline font-bold text-[18px] tracking-wider text-[#F1F5F9]">
            DECODE
          </span>
        </div>

        {/* HUD Telemetry: Streak & XP in Master Amber */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#121826] border border-[#263047] px-2.5 py-1 rounded-full text-[13px] font-mono text-[#F59E0B]">
            <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">
              local_fire_department
            </span>
            <span className="font-bold">{user?.streak.current ?? 1}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#121826] border border-[#263047] px-2.5 py-1 rounded-full text-[13px] font-mono text-[#F59E0B]">
            <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">
              bolt
            </span>
            <span className="font-bold">{user?.totalXP ?? 0} XP</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-[260px] flex flex-col w-full">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8 flex-1 flex flex-col pb-24 md:pb-8">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <TabBar />
    </div>
  );
}
