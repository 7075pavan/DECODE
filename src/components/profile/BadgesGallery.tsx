"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

interface Badge {
  id: string;
  title: string;
  path: string;
  icon: string;
  unlocked: boolean;
}

const ALL_BADGES: Badge[] = [
  {
    id: "badge-reading-people-unit-1",
    title: "Baseline Decryptor",
    path: "Reading People",
    icon: "visibility",
    unlocked: true,
  },
  {
    id: "badge-reading-people-unit-2",
    title: "Cluster Analyst",
    path: "Reading People",
    icon: "hub",
    unlocked: false,
  },
  {
    id: "badge-reading-people-unit-3",
    title: "Kinetic Polygraph",
    path: "Reading People",
    icon: "directions_walk",
    unlocked: false,
  },
  {
    id: "badge-detective-mind-unit-1",
    title: "Sherlockian Deductor",
    path: "Detective Mind",
    icon: "search",
    unlocked: false,
  },
  {
    id: "badge-detective-mind-unit-2",
    title: "First-Principle Mind",
    path: "Detective Mind",
    icon: "foundation",
    unlocked: false,
  },
  {
    id: "badge-detective-mind-unit-3",
    title: "Occam's Edge",
    path: "Detective Mind",
    icon: "content_cut",
    unlocked: false,
  },
  {
    id: "badge-mind-and-mindset-unit-1",
    title: "Radical Agency",
    path: "Mind & Mindset",
    icon: "adjust",
    unlocked: false,
  },
  {
    id: "badge-mind-and-mindset-unit-2",
    title: "Vagal Composure",
    path: "Mind & Mindset",
    icon: "air",
    unlocked: false,
  },
  {
    id: "badge-mind-and-mindset-unit-3",
    title: "Antifragile Operator",
    path: "Mind & Mindset",
    icon: "shield",
    unlocked: false,
  },
  {
    id: "badge-influence-negotiation-unit-1",
    title: "Tactical Empath",
    path: "Influence",
    icon: "hearing",
    unlocked: false,
  },
  {
    id: "badge-influence-negotiation-unit-2",
    title: "Frame Master",
    path: "Influence",
    icon: "anchor",
    unlocked: false,
  },
  {
    id: "badge-influence-negotiation-unit-3",
    title: "BATNA Architect",
    path: "Influence",
    icon: "security",
    unlocked: false,
  },
  {
    id: "badge-money-wealth-unit-1",
    title: "Day-1 Harvester",
    path: "Money & Wealth",
    icon: "savings",
    unlocked: false,
  },
  {
    id: "badge-money-wealth-unit-2",
    title: "Bias Slayer",
    path: "Money & Wealth",
    icon: "psychology",
    unlocked: false,
  },
  {
    id: "badge-money-wealth-unit-3",
    title: "Compounding Engine",
    path: "Money & Wealth",
    icon: "rocket_launch",
    unlocked: false,
  },
];

interface BadgesGalleryProps {
  earnedBadges?: { id: string; title: string; icon: string }[];
}

export function BadgesGallery({ earnedBadges = [] }: BadgesGalleryProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <Card className="p-6 bg-[#121826] border-[#263047] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline text-[17px] font-bold text-[#F1F5F9]">
            Mastery Badges
          </h3>
          <span className="text-[13px] text-[#94A3B8]">
            Milestone shields unlocked via 80%+ scores on Unit Mastery Checks.
          </span>
        </div>
        <Chip variant="amber" size="sm">
          {earnedBadges.length || 1} / {ALL_BADGES.length} Unlocked
        </Chip>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {ALL_BADGES.map((badge) => {
          const isUnlocked = badge.unlocked || earnedIds.has(badge.id);

          return (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl flex flex-col items-center text-center transition-all ${
                isUnlocked
                  ? "bg-[#1A2233] border-2 border-[#F59E0B]/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "bg-[#0B0F1A] border border-[#263047] opacity-40 grayscale"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                  isUnlocked
                    ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50"
                    : "bg-[#1A2233] text-[#64748B]"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {badge.icon}
                </span>
              </div>

              <span className="text-[13px] font-bold text-[#F1F5F9] leading-tight">
                {badge.title}
              </span>
              <span className="text-[11px] font-mono text-[#94A3B8] mt-0.5">
                {badge.path}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
