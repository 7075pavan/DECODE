"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useReviewStore } from "@/lib/stores/useReviewStore";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { getDueCount } = useReviewStore();
  const dueCount = getDueCount();

  const navItems = [
    { name: "Home", href: "/home", icon: "radar" },
    { name: "Paths", href: "/paths", icon: "alt_route" },
    { name: "Simulator", href: "/simulator", icon: "trending_up" },
    { name: "Review", href: "/review", icon: "psychology", badge: dueCount },
    { name: "Profile", href: "/profile", icon: "shield" },
    { name: "Settings", href: "/settings", icon: "settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 bg-[#0B0F1A] border-r border-[#263047] z-40 p-5 justify-between">
      {/* Brand & Top Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <div className="relative w-10 h-10 rounded-full bg-[#070A12] border border-[#263047] flex items-center justify-center shadow-lg shadow-[#22D3EE]/10 flex-shrink-0">
            <span className="material-symbols-outlined text-[#22D3EE] text-[22px]">
              fingerprint
            </span>
          </div>
          <div>
            <span className="font-headline text-[20px] font-bold text-[#F1F5F9] tracking-wider uppercase block leading-tight">
              DECODE
            </span>
            <span className="text-[13px] text-[#94A3B8] font-mono tracking-tight block">
              Cognitive Suite
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-150 cursor-pointer group",
                  isActive
                    ? "bg-[#1A2233] text-[#22D3EE] font-semibold border border-[#263047]"
                    : "text-[#94A3B8] hover:bg-[#121826] hover:text-[#F1F5F9]"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "material-symbols-outlined text-[22px] transition-colors",
                      isActive ? "text-[#22D3EE]" : "text-[#94A3B8] group-hover:text-[#F1F5F9]"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[15px]">{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#22D3EE] text-[#0B0F1A] text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Telemetry & Status Card */}
      <div className="flex flex-col gap-3">
        {/* Streak and XP HUD */}
        <div className="grid grid-cols-2 gap-2 bg-[#121826] border border-[#263047] p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">
              local_fire_department
            </span>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#F59E0B] leading-none">
                {user?.streak.current ?? 1}
              </span>
              <span className="text-[13px] text-[#94A3B8] font-mono leading-none mt-1">
                Streak
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-[#263047] pl-2">
            <span className="material-symbols-outlined text-[#F59E0B] text-[20px]">
              bolt
            </span>
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-[#F59E0B] leading-none">
                {user?.totalXP ?? 0}
              </span>
              <span className="text-[13px] text-[#94A3B8] font-mono leading-none mt-1">
                XP
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-[#121826] border border-[#263047] p-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-[#1A2233] border border-[#263047] flex items-center justify-center text-[#22D3EE] font-headline font-bold text-[16px] flex-shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[15px] font-medium text-[#F1F5F9] truncate">
              {user?.displayName || "Pavan"}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[13px] text-[#22D3EE] font-mono font-semibold truncate">
                {user?.currentRank || "Rookie"}
              </span>
              {user?.isAnonymous && (
                <span className="text-[11px] bg-[#263047] text-[#94A3B8] px-1.5 py-0.5 rounded font-mono">
                  Guest
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
