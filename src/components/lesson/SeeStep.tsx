"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

interface Clue {
  id: string;
  phrase: string;
  strength: "Weak" | "Medium" | "Strong";
  category: string;
  explanation: string;
}

interface SeeStepProps {
  seeData: any;
  onComplete: () => void;
}

export const SeeStep: React.FC<SeeStepProps> = ({ seeData, onComplete }) => {
  const [activeClue, setActiveClue] = useState<Clue | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(true);
  const [viewedClues, setViewedClues] = useState<Set<string>>(new Set());

  const handleClueClick = (clueId: string) => {
    const found = seeData.clues.find((c: Clue) => c.id === clueId);
    if (found) {
      setActiveClue(found);
      setViewedClues((prev) => new Set(prev).add(clueId));
    }
  };

  const strengthColorMap: Record<string, "default" | "cyan" | "coral"> = {
    Weak: "default",
    Medium: "cyan",
    Strong: "coral",
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto py-4 relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-mono text-[#22D3EE] font-semibold uppercase tracking-wider">
          Step 2 of 6 · See
        </span>
        <span className="text-[13px] font-mono text-[#94A3B8]">
          Tappable Case Study
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-[24px] md:text-[28px] font-bold text-[#F1F5F9]">
          {seeData.title}
        </h1>
        <p className="text-[15px] text-[#94A3B8]">
          {seeData.scenarioDescription}
        </p>
      </div>

      {/* Collapsible Scenario Image (Max 120px tall) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[13px] text-[#94A3B8] font-mono">
          <span>Scene: {seeData.scenarioTitle}</span>
          <button
            type="button"
            onClick={() => setIsImageExpanded(!isImageExpanded)}
            className="flex items-center gap-1 hover:text-[#22D3EE] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isImageExpanded ? "visibility_off" : "visibility"}
            </span>
            <span>{isImageExpanded ? "Hide photo" : "Show photo"}</span>
          </button>
        </div>

        {isImageExpanded && (
          <div className="relative w-full h-[120px] max-h-[120px] rounded-xl overflow-hidden bg-[#1A2233] border border-[#263047]">
            <Image
              src={seeData.imageUrl}
              alt={seeData.scenarioTitle}
              fill
              className="object-cover"
              sizes="(max-w-768px) 100vw, 800px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A]/80 via-transparent to-transparent" />
          </div>
        )}
      </div>

      {/* Clues Instruction Callout */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A2233]/70 border border-[#263047] text-[13px]">
        <div className="flex items-center gap-2 text-[#22D3EE]">
          <span className="material-symbols-outlined text-[18px]">touch_app</span>
          <span className="font-medium">Tap highlighted text to inspect forensic signals</span>
        </div>
        <span className="font-mono text-[#94A3B8]">
          {viewedClues.size} of {seeData.clues.length} inspected
        </span>
      </div>

      {/* Interactive Story Narrative */}
      <Card className="p-5 md:p-6 bg-[#121826] border-[#263047] flex flex-col gap-4 text-[16px] leading-[28px] text-[#F1F5F9] font-body">
        {seeData.story.map((block: any, idx: number) => {
          if (block.type === "paragraph") {
            return (
              <p key={idx} className="text-[#dfe2f2]">
                {block.text}
              </p>
            );
          }

          if (block.type === "interactive_paragraph") {
            return (
              <p key={idx} className="text-[#dfe2f2]">
                {block.segments.map((seg: any, sIdx: number) => {
                  if (seg.isClue) {
                    const isViewed = viewedClues.has(seg.clueId);
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleClueClick(seg.clueId)}
                        className={`inline text-left font-semibold transition-all px-1.5 py-0.5 rounded cursor-pointer border-b-2 ${
                          isViewed
                            ? "bg-[#22D3EE]/15 border-[#22D3EE] text-[#22D3EE]"
                            : "bg-[#22D3EE]/10 border-[#22D3EE]/80 text-[#8AEBFF] hover:bg-[#22D3EE]/25 animate-pulse"
                        }`}
                      >
                        {seg.text}
                      </button>
                    );
                  }
                  return <span key={sIdx}>{seg.text}</span>;
                })}
              </p>
            );
          }
          return null;
        })}
      </Card>

      {/* Forensic Takeaway Callout */}
      <div className="p-4 rounded-xl bg-[#121826] border border-[#263047] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#22D3EE] text-[22px] mt-0.5 flex-shrink-0">
          psychology
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-mono text-[#22D3EE] font-bold uppercase tracking-wider">
            Forensic Takeaway
          </span>
          <p className="text-[15px] text-[#94A3B8] leading-relaxed">
            {seeData.forensicTakeaway}
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <Button variant="primary" onClick={onComplete} className="gap-2">
          <span>Start interactive practice (Try)</span>
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </Button>
      </div>

      {/* Bottom Sheet Drawer for Active Clue */}
      {activeClue && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg bg-[#121826] border-t sm:border border-[#263047] rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle for Mobile */}
            <div className="w-12 h-1 bg-[#263047] rounded-full mx-auto sm:hidden mb-2" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Chip variant={strengthColorMap[activeClue.strength]}>
                    {activeClue.strength} Signal
                  </Chip>
                  <span className="text-[13px] font-mono text-[#94A3B8]">
                    {activeClue.category}
                  </span>
                </div>
                <h3 className="font-headline text-[18px] font-bold text-[#F1F5F9] mt-1">
                  &ldquo;{activeClue.phrase}&rdquo;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveClue(null)}
                className="w-8 h-8 rounded-lg bg-[#1A2233] flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#1A2233] border border-[#263047] text-[15px] leading-relaxed text-[#dfe2f2]">
              {activeClue.explanation}
            </div>

            <Button
              variant="secondary"
              onClick={() => setActiveClue(null)}
              className="h-[48px] text-[15px]"
            >
              Back to story
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
