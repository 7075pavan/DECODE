"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UnitOutline } from "@/content/paths";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

interface WindingPathProps {
  pathId: string;
  pathTitle: string;
  units: UnitOutline[];
  unlockedUnits: string[];
  completedUnits: string[];
}

export function WindingPath({
  pathId,
  pathTitle,
  units,
  unlockedUnits,
  completedUnits,
}: WindingPathProps) {
  const router = useRouter();
  const [selectedUnit, setSelectedUnit] = useState<UnitOutline | null>(null);

  // Determine node statuses
  const getNodeState = (unit: UnitOutline, index: number) => {
    const isCompleted = completedUnits.includes(unit.id);
    const isUnlocked =
      unit.isUnlockedDefault ||
      unlockedUnits.includes(unit.id) ||
      (index === 0 && true) ||
      (index > 0 && completedUnits.includes(units[index - 1]?.id));

    if (isCompleted) return "done";
    if (isUnlocked) return "current";
    return "locked";
  };

  // Horizontal offsets for the winding effect (alternating left, right, center)
  const getOffsetClass = (index: number) => {
    const pattern = [
      "translate-x-0", // Node 1: center
      "translate-x-12 md:translate-x-20", // Node 2: right
      "-translate-x-12 md:-translate-x-20", // Node 3: left
      "translate-x-12 md:translate-x-20", // Node 4: right
      "translate-x-0", // Node 5: center
    ];
    return pattern[index % pattern.length];
  };

  const handleNodeClick = (unit: UnitOutline, state: "done" | "current" | "locked") => {
    if (state === "locked" && !unit.isPlayable) {
      return;
    }
    setSelectedUnit(unit);
  };

  return (
    <div className="relative flex flex-col items-center py-8 w-full max-w-xl mx-auto">
      {/* Visual background guide curve */}
      <div className="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-1 border-r-2 border-dashed border-[#263047] pointer-events-none" />

      {/* Nodes list */}
      <div className="flex flex-col items-center gap-14 w-full relative z-10">
        {units.map((unit, index) => {
          const state = getNodeState(unit, index);
          const isShield = unit.isMasteryShield;
          const offsetClass = getOffsetClass(index);

          return (
            <div
              key={unit.id}
              className={`flex flex-col items-center transition-transform duration-300 ${offsetClass}`}
            >
              {/* Connector from previous node */}
              {index > 0 && (
                <div className="hidden" />
              )}

              {/* Node Button */}
              <button
                type="button"
                onClick={() => handleNodeClick(unit, state)}
                disabled={state === "locked" && !unit.isPlayable}
                className={`relative group flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none ${
                  isShield ? "w-20 h-20" : "w-16 h-16"
                } ${
                  state === "done"
                    ? "bg-[#10B981]/20 border-2 border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105"
                    : state === "current"
                    ? "bg-[#22D3EE]/20 border-2 border-[#22D3EE] text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse hover:scale-110"
                    : "bg-[#121826] border-2 border-[#263047] text-[#64748B] opacity-60 cursor-not-allowed"
                }`}
                aria-label={`${unit.title} (${state})`}
              >
                {/* Active Ring Glow */}
                {state === "current" && (
                  <span className="absolute -inset-1.5 rounded-full border border-[#22D3EE]/40 animate-ping pointer-events-none" />
                )}

                {/* Node Icon */}
                {state === "done" ? (
                  <span className="material-symbols-outlined text-[30px] font-bold">
                    check
                  </span>
                ) : isShield ? (
                  <span
                    className={`material-symbols-outlined ${
                      isShield ? "text-[34px]" : "text-[26px]"
                    } ${state === "current" ? "text-[#F59E0B]" : ""}`}
                  >
                    security
                  </span>
                ) : state === "current" ? (
                  <span className="material-symbols-outlined text-[28px]">
                    play_arrow
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[24px]">
                    lock
                  </span>
                )}

                {/* Floating Unit Number Pill */}
                <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-[#0B0F1A] border border-[#263047] text-[13px] font-mono text-[#94A3B8]">
                  U{unit.unitNumber}
                </span>
              </button>

              {/* Node Title & Metadata */}
              <div className="mt-3 flex flex-col items-center text-center max-w-[200px]">
                <span className="text-[14px] font-bold text-[#F1F5F9] leading-tight">
                  {unit.title}
                </span>
                <span className="text-[13px] text-[#94A3B8] font-mono mt-0.5">
                  {unit.estimatedMinutes} min · {unit.xpReward} XP
                </span>
                {isShield && (
                  <span className="mt-1 px-2 py-0.5 rounded text-[13px] font-mono font-bold tracking-wider uppercase bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                    Mastery Shield
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Unit Overview Bottom Sheet / Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg bg-[#121826] border-[#263047] p-6 rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom duration-300">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedUnit(null)}
              className="absolute top-5 right-5 text-[#94A3B8] hover:text-white p-1 rounded-lg bg-[#1A2233] border border-[#263047]"
              aria-label="Close Overview"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-mono text-[#22D3EE] font-semibold">
                Unit {selectedUnit.unitNumber} of {units.length}
              </span>
              {selectedUnit.isMasteryShield && (
                <Chip variant="amber" size="sm">
                  Mastery Checkpoint
                </Chip>
              )}
            </div>

            <h2 className="font-headline text-[22px] font-bold text-[#F1F5F9]">
              {selectedUnit.title}
            </h2>
            <p className="text-[14px] text-[#94A3B8] mt-1 leading-relaxed">
              {selectedUnit.description}
            </p>

            {/* 6-Step Tracker Dossier */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between text-[13px] font-mono font-bold uppercase text-[#94A3B8] border-b border-[#263047] pb-2">
                <span>The 6-Step Lesson Loop</span>
                <span className="text-[#22D3EE]">{selectedUnit.estimatedMinutes} min total</span>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-1">
                {[
                  {
                    step: 1,
                    name: "Learn",
                    desc: "Swipeable concepts + 1 Key Rule",
                    icon: "menu_book",
                    color: "text-[#22D3EE]",
                  },
                  {
                    step: 2,
                    name: "See",
                    desc: "Interactive worked scenario with diagnostics",
                    icon: "find_in_page",
                    color: "text-[#22D3EE]",
                  },
                  {
                    step: 3,
                    name: "Try",
                    desc: "3 practice cases (emotion, intent, move) + slider",
                    icon: "quiz",
                    color: "text-[#22D3EE]",
                  },
                  {
                    step: 4,
                    name: "Review",
                    desc: "Feedback & Leitner Spaced Repetition",
                    icon: "fact_check",
                    color: "text-[#38BDF8]",
                  },
                  {
                    step: 5,
                    name: "Prove",
                    desc: "8-question mastery check (80% benchmark)",
                    icon: "verified",
                    color: "text-[#F59E0B]",
                  },
                  {
                    step: 6,
                    name: "Apply",
                    desc: "Real-world field mission & reflection",
                    icon: "task_alt",
                    color: "text-[#10B981]",
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1A2233]/60 border border-[#263047]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0B0F1A] border border-[#263047] flex items-center justify-center flex-shrink-0">
                      <span className={`material-symbols-outlined text-[18px] ${item.color}`}>
                        {item.icon}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-mono text-[#94A3B8]">
                          0{item.step}
                        </span>
                        <span className="text-[14px] font-bold text-[#F1F5F9]">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[13px] text-[#94A3B8] leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch / Action CTA */}
            <div className="mt-6 flex flex-col gap-2">
              {selectedUnit.isPlayable ? (
                <Button
                  variant="primary"
                  className="w-full h-14"
                  onClick={() => {
                    router.push(`/lesson/${selectedUnit.id}`);
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>
                      {completedUnits.includes(selectedUnit.id)
                        ? "Review Unit"
                        : "Start 6-Step Loop"}
                    </span>
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </span>
                </Button>
              ) : (
                <div className="p-3 rounded-xl bg-[#1A2233] border border-[#263047] text-center text-[13px] text-[#94A3B8]">
                  <span>{selectedUnit.unlockRequirement || "Locked · Complete prior units"}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
