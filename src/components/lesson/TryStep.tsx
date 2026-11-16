"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Chip } from "@/components/ui/Chip";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { calculateStepXP, calculateQuestionNetXP, calculateBrierScore } from "@/lib/scoring/scoringEngine";
import { useReviewStore } from "@/lib/stores/useReviewStore";
import { createLeitnerItem } from "@/lib/srs/leitnerEngine";
import { LessonSummary, SessionStats } from "./LessonSummary";

interface TryStepProps {
  tryData: any;
  onComplete: (sessionStats: SessionStats) => void;
  onExit?: () => void;
}

export const TryStep: React.FC<TryStepProps> = ({ tryData, onComplete, onExit }) => {
  const { addMissedConcept } = useReviewStore();
  const scenarios = tryData.scenarios.slice(0, 3);

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(80);
  const [isChecked, setIsChecked] = useState(false);
  const [isStoryExpanded, setIsStoryExpanded] = useState(true);

  // Tracking across the 3 scenarios
  // questionSteps: stores steps for current scenario to enforce question net XP >= 0
  const [currentQuestionSteps, setCurrentQuestionSteps] = useState<{ isCorrect: boolean; confidence: number }[]>([]);
  const [allPredictions, setAllPredictions] = useState<{ confidence: number; isCorrect: boolean }[]>([]);
  const [accumulatedXP, setAccumulatedXP] = useState(0);
  const [lastStepXPResult, setLastStepXPResult] = useState<{ baseXP: number; calibrationDelta: number; stepXP: number } | null>(null);
  const [missedConcepts, setMissedConcepts] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [finalStats, setFinalStats] = useState<SessionStats | null>(null);

  const currentScenario = scenarios[scenarioIndex];
  const currentSubStep = currentScenario.subSteps[subStepIndex];
  const selectedOption = currentSubStep.options.find((o: any) => o.id === selectedOptionId);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const totalScreens = scenarios.length * 3;
  const currentScreenNumber = scenarioIndex * 3 + subStepIndex + 1;
  const progressPercent = Math.round((currentScreenNumber / totalScreens) * 100);

  const handleCheckAnswer = () => {
    if (!selectedOptionId) return;

    // Calculate exact step XP
    const stepRes = calculateStepXP(isCorrect, confidence);
    setLastStepXPResult(stepRes);

    const updatedQSteps = [...currentQuestionSteps, { isCorrect, confidence }];
    setCurrentQuestionSteps(updatedQSteps);

    const updatedPredictions = [...allPredictions, { confidence, isCorrect }];
    setAllPredictions(updatedPredictions);

    // If incorrect, queue the missed concept in Leitner store
    if (!isCorrect) {
      const clue = currentScenario.clues[0] || {
        text: currentSubStep.question,
        explanation: currentSubStep.forensicExplanation,
        strength: "Medium",
      };
      const leitnerItem = createLeitnerItem({
        id: `missed-${currentScenario.id}-${currentSubStep.subStepType}`,
        conceptTitle: `${currentScenario.character}: ${currentSubStep.stepLabel.split("·")[1]?.trim() || "Signal"}`,
        cueText: clue.text,
        explanation: clue.explanation,
        strength: clue.strength,
      });

      addMissedConcept(leitnerItem);
      setMissedConcepts((prev) => [...prev.filter((c) => c.id !== leitnerItem.id), leitnerItem]);
    }

    setIsChecked(true);
  };

  const handleNext = () => {
    setIsChecked(false);
    setSelectedOptionId(null);
    setConfidence(80);

    const isLastSubStep = subStepIndex === currentScenario.subSteps.length - 1;
    const isLastScenario = scenarioIndex === scenarios.length - 1;

    if (isLastSubStep) {
      // End of this question/scenario: calculate net XP for the 3 steps (net >= 0)
      const qNet = calculateQuestionNetXP(currentQuestionSteps);
      const newAccumulated = accumulatedXP + qNet.netXP;
      setAccumulatedXP(newAccumulated);
      setCurrentQuestionSteps([]);

      if (isLastScenario) {
        // Complete practice! Compute Brier stats
        const brierData = calculateBrierScore(allPredictions);
        const stats: SessionStats = {
          totalXPEarned: newAccumulated,
          accuracy: brierData.accuracy,
          brierScore: brierData.brierScore,
          avgConfidence: brierData.avgConfidence,
          calibrationMatchPercent: brierData.calibrationMatchPercent,
          calibrationVerdict: brierData.calibrationVerdict,
          missedConcepts,
        };
        setFinalStats(stats);
        setShowSummary(true);
        return;
      } else {
        setScenarioIndex((prev) => prev + 1);
        setSubStepIndex(0);
        setIsStoryExpanded(true);
      }
    } else {
      setSubStepIndex((prev) => prev + 1);
    }
  };

  const strengthColorMap: Record<string, "default" | "cyan" | "coral"> = {
    Weak: "default",
    Medium: "cyan",
    Strong: "coral",
  };

  // If session finished, show LessonSummary screen
  if (showSummary && finalStats) {
    return (
      <LessonSummary
        stats={finalStats}
        onContinue={() => onComplete(finalStats)}
        continueLabel="Proceed to mastery assessment"
      />
    );
  }

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={onExit || (() => window.history.back())}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[14px] font-medium text-[#94A3B8] font-body">
            Question {scenarioIndex + 1} of {scenarios.length} · {currentSubStep.stepLabel}
          </span>
          <span className="text-[12px] font-mono text-[#22D3EE]">
            Case: {currentScenario.character}
          </span>
        </div>

        {/* Master Amber XP Pill */}
        <div className="flex items-center gap-1 bg-[#121826] border border-[#263047] px-2.5 py-1 rounded-full text-[13px] font-mono text-[#F59E0B]">
          <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">bolt</span>
          <span>+{accumulatedXP} XP</span>
        </div>
      </div>

      <ProgressBar progress={progressPercent} color="cyan" height="h-1.5" className="mb-4" />

      {/* QUESTION VIEW */}
      {!isChecked ? (
        <div className="flex flex-col gap-4">
          {/* Collapsible Scenario Box */}
          <Card className="bg-[#0F1422] border-[#263047] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[13px] font-mono text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#22D3EE] text-[18px]">
                  visibility
                </span>
                <span className="text-[#F1F5F9] font-medium">The scenario</span>
              </div>
              <button
                type="button"
                onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                className="flex items-center gap-1 text-[#22D3EE] hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isStoryExpanded ? "visibility_off" : "visibility"}
                </span>
                <span>{isStoryExpanded ? "Hide story" : "Show story"}</span>
              </button>
            </div>

            {isStoryExpanded && (
              <>
                <div className="relative w-full h-[120px] max-h-[120px] rounded-lg overflow-hidden bg-[#1A2233] border border-[#263047]">
                  <Image
                    src={currentScenario.imageUrl}
                    alt={currentScenario.contextTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1422]/90 via-transparent to-transparent" />
                </div>

                <p className="text-[15px] leading-relaxed text-[#dfe2f2] font-body">
                  {currentScenario.story}
                </p>
              </>
            )}
          </Card>

          {/* Question Title - Never truncated */}
          <h2 className="font-headline text-[20px] md:text-[22px] font-bold text-[#F1F5F9] leading-snug">
            {currentSubStep.question}
          </h2>

          {/* Multi-choice Option Cards */}
          <div className="flex flex-col gap-2.5">
            {currentSubStep.options.map((option: any) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                    isSelected
                      ? "bg-[#1A2233] border-[#22D3EE] shadow-[0_0_16px_-4px_rgba(34,211,238,0.25)]"
                      : "bg-[#121826] border-[#263047] hover:border-[#22D3EE]/40"
                  }`}
                >
                  <span
                    className={`text-[15px] font-medium leading-snug pr-3 ${
                      isSelected ? "text-[#22D3EE] font-semibold" : "text-[#F1F5F9]"
                    }`}
                  >
                    {option.text}
                  </span>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? "border-[#22D3EE] bg-[#22D3EE]"
                        : "border-[#859397] bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#0B0F1A]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confidence Calibration Slider */}
          <Card className="bg-[#121826] border-[#263047] p-4">
            <Slider
              value={confidence}
              onChange={setConfidence}
              min={50}
              max={100}
              step={5}
              label="How sure are you?"
              helperText="More confident = more XP if right, fewer points if wrong."
            />
          </Card>

          {/* 56px Button - Disabled until option is selected */}
          <div className="pt-2">
            <Button
              variant="primary"
              disabled={!selectedOptionId}
              onClick={handleCheckAnswer}
              className="gap-2"
            >
              <span>Check answer</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </Button>
          </div>
        </div>
      ) : (
        /* FEEDBACK VIEW */
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Header Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#121826] border border-[#263047]">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCorrect
                    ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/40"
                    : "bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/40"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {isCorrect ? "check" : "close"}
                </span>
              </div>
              <div className="flex flex-col">
                <h3
                  className={`font-headline text-[20px] font-bold ${
                    isCorrect ? "text-[#34D399]" : "text-[#F87171]"
                  }`}
                >
                  {isCorrect ? "Correct!" : "Not quite"}
                </h3>
                <span className="text-[13px] text-[#94A3B8]">
                  {isCorrect
                    ? `You were ${confidence}% sure and right`
                    : `You were ${confidence}% sure and wrong`}
                </span>
              </div>
            </div>

            {/* Amber XP Pill displaying exact step result */}
            <Chip variant="amber" className="font-bold">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>
                {lastStepXPResult && lastStepXPResult.stepXP >= 0
                  ? `+${lastStepXPResult.stepXP} XP`
                  : `${lastStepXPResult?.stepXP} XP`}
              </span>
            </Chip>
          </div>

          {/* If Wrong Answer: Show "Your Answer" in Coral */}
          {!isCorrect && selectedOption && (
            <div className="bg-[#121826] border border-[#F87171]/40 p-4 rounded-xl flex flex-col gap-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-mono font-bold text-[#F87171] uppercase tracking-wide">
                  Your answer
                </span>
                <span className="material-symbols-outlined text-[#F87171] text-[20px]">
                  cancel
                </span>
              </div>
              <p className="text-[15px] font-medium text-[#F1F5F9]">
                {selectedOption.text}
              </p>
              <p className="text-[13px] text-[#94A3B8] mt-1 leading-snug">
                {selectedOption.reason}
              </p>
            </div>
          )}

          {/* Right Answer Box */}
          <div className="bg-[#121826] border border-[#34D399]/40 p-4 rounded-xl flex flex-col gap-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-mono font-bold text-[#34D399] uppercase tracking-wide">
                The right answer
              </span>
              <span className="material-symbols-outlined text-[#34D399] text-[20px]">
                check_circle
              </span>
            </div>
            <p className="text-[15px] font-semibold text-[#F1F5F9]">
              {currentSubStep.options.find((o: any) => o.isCorrect)?.text}
            </p>
            <div className="mt-1 pt-2 border-t border-[#263047]">
              <span className="text-[13px] font-mono text-[#94A3B8] font-bold uppercase">
                Why
              </span>
              <p className="text-[14px] text-[#dfe2f2] leading-relaxed mt-0.5">
                {currentSubStep.forensicExplanation}
              </p>
            </div>
          </div>

          {/* Clues in the story */}
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-mono text-[#94A3B8] uppercase tracking-wider">
              {isCorrect ? "Clues in the story" : "Clues you may have missed"}
            </span>

            <div className="flex flex-col gap-2">
              {currentScenario.clues.map((clue: any) => (
                <div
                  key={clue.id}
                  className="p-3.5 rounded-xl bg-[#121826] border border-[#263047] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#F1F5F9]">
                      {clue.text}
                    </span>
                    <Chip variant={strengthColorMap[clue.strength]} size="sm">
                      {clue.strength}
                    </Chip>
                  </div>
                  <p className="text-[13px] text-[#94A3B8] leading-snug">
                    {clue.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Forensic Rule Banner */}
          <div className="p-3.5 bg-[#121826] rounded-xl flex items-start gap-3 border border-[#263047]">
            <span className="material-symbols-outlined text-[#22D3EE] text-[20px] mt-0.5 flex-shrink-0">
              info
            </span>
            <p className="text-[14px] text-[#94A3B8] leading-relaxed">
              Body language shows feelings, not proof. Check with a question.
            </p>
          </div>

          {/* 56px Next Button */}
          <div className="pt-2">
            <Button variant="primary" onClick={handleNext} className="gap-2">
              <span>Next question</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
