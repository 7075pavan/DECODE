"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReviewStore } from "@/lib/stores/useReviewStore";
import { cn } from "@/lib/utils";

export const TabBar: React.FC = () => {
  const pathname = usePathname();
  const { getDueCount } = useReviewStore();
  const dueCount = getDueCount();

  const tabs = [
    { name: "Home", href: "/home", icon: "radar" },
    { name: "Paths", href: "/paths", icon: "alt_route" },
    { name: "Review", href: "/review", icon: "psychology", badge: dueCount },
    { name: "Profile", href: "/profile", icon: "shield" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-lg border-t border-[#263047] pb-[max(env(safe-area-inset-bottom),8px)] pt-2 px-4">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-3 min-w-[64px] transition-all duration-150 cursor-pointer",
                isActive ? "text-[#22D3EE]" : "text-[#94A3B8] hover:text-[#F1F5F9]"
              )}
            >
              <div className="relative">
                <span className="material-symbols-outlined text-[24px]">
                  {tab.icon}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#22D3EE] text-[#0B0F1A] text-[13px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[13px] font-medium tracking-tight mt-0.5",
                  isActive ? "text-[#22D3EE] font-semibold" : "text-[#94A3B8]"
                )}
              >
                {tab.name}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-[#22D3EE] rounded-full shadow-sm shadow-[#22D3EE]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
