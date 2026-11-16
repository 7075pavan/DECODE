"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Chip";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useReviewStore } from "@/lib/stores/useReviewStore";
import { createLeitnerItem } from "@/lib/srs/leitnerEngine";

interface ProveStepProps {
  proveData: any;
  onPass: (score: number) => void;
  onExit?: () => void;
}

export const ProveStep: React.FC<ProveStepProps> = ({ proveData, onPass, onExit }) => {
  const { unlockUnitAndAwardBadge } = useAuthStore();
  const { addMissedConcept } = useReviewStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, { selectedId: string; isCorrect: boolean }>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = proveData.questions[currentIndex];
  const totalQuestions = proveData.questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleNextQuestion = () => {
    if (!selectedOptionId) return;

    const chosen = currentQuestion.options.find((o: any) => o.id === selectedOptionId);
    const isCorrect = chosen?.isCorrect ?? false;

    // If incorrect, record as a weak concept in the Leitner review queue
    if (!isCorrect) {
      addMissedConcept(
        createLeitnerItem({
          id: `prove-missed-${currentQuestion.id}`,
          conceptTitle: `Mastery Concept: Q${currentIndex + 1}`,
          cueText: currentQuestion.question,
          explanation: currentQuestion.explanation,
          strength: "Strong",
        })
      );
    }

    const updatedAnswers = {
      ...answers,
      [currentIndex]: { selectedId: selectedOptionId, isCorrect },
    };
    setAnswers(updatedAnswers);
    setSelectedOptionId(null);

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all 8 questions
      const finalCorrectCount = Object.values(updatedAnswers).filter((a) => a.isCorrect).length;
      if (finalCorrectCount >= proveData.requiredCorrect) {
        // 80%+ unlocks Unit 2 and awards badge
        unlockUnitAndAwardBadge("reading-people-unit-1", "reading-people-unit-2", {
          id: "badge-baseline-decoder",
          title: "Baseline Decryption Badge",
          icon: "military_tech",
        });
      }
      setIsFinished(true);
    }
  };

  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = correctCount >= proveData.requiredCorrect; // 7/8 = 87.5% >= 80%

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsFinished(false);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto py-2">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={onExit || (() => window.history.back())}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <span className="text-[14px] font-medium text-[#94A3B8] font-body">
          Mastery Check · Question {currentIndex + 1} of {totalQuestions}
        </span>

        <Chip variant="cyan" size="sm">
          80% to pass
        </Chip>
      </div>

      <ProgressBar progress={progressPercent} color="cyan" height="h-1.5" className="mb-5" />

      {!isFinished ? (
        <div className="flex flex-col gap-5">
          {/* Question Title */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-mono text-[#22D3EE] uppercase tracking-wider">
              Diagnostic #{currentIndex + 1}
            </span>
            <h2 className="font-headline text-[20px] md:text-[22px] font-bold text-[#F1F5F9] leading-snug">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2.5">
            {currentQuestion.options.map((option: any) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                    isSelected
                      ? "bg-[#1A2233] border-[#22D3EE] shadow-[0_0_16px_-4px_rgba(34,211,238,0.25)]"
                      : "bg-[#121826] border-[#263047] hover:border-[#22D3EE]/40"
                  }`}
                >
                  <span
                    className={`text-[15px] font-medium leading-relaxed pr-3 ${
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

          {/* 56px Primary Action Button */}
          <div className="pt-4">
            <Button
              variant="primary"
              disabled={!selectedOptionId}
              onClick={handleNextQuestion}
              className="gap-2"
            >
              <span>{currentIndex === totalQuestions - 1 ? "Submit assessment" : "Next question"}</span>
              <span className="material-symbols-outlined text-[20px]">
                arrow_forward
              </span>
            </Button>
          </div>
        </div>
      ) : (
        /* MASTERY SCORE RESULTS VIEW */
        <div className="flex flex-col gap-5 animate-fadeIn">
          <Card
            className={`p-6 border text-center flex flex-col items-center gap-3 ${
              isPassed
                ? "border-[#34D399]/40 bg-gradient-to-b from-[#121826] to-[#0D241C]"
                : "border-[#F87171]/40 bg-gradient-to-b from-[#121826] to-[#241212]"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isPassed
                  ? "bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/50"
                  : "bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/50"
              }`}
            >
              <span className="material-symbols-outlined text-[36px]">
                {isPassed ? "military_tech" : "lock"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h2
                className={`font-headline text-[24px] font-bold ${
                  isPassed ? "text-[#34D399]" : "text-[#F87171]"
                }`}
              >
                {isPassed ? "Mastery Achieved!" : "Next Unit Blocked"}
              </h2>
              <p className="text-[15px] text-[#94A3B8]">
                {isPassed
                  ? `You scored ${correctCount} of ${totalQuestions} (${percentage}%). Required 80% benchmark achieved!`
                  : `You scored ${correctCount} of ${totalQuestions} (${percentage}%). Next unit is locked until 80% benchmark (7/8) is met.`}
              </p>
            </div>

            {/* Awarded Badge if Passed */}
            {isPassed ? (
              <div className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-[#1A2233] border border-[#34D399]/40 w-full mt-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#F59E0B] text-[22px]">
                    military_tech
                  </span>
                  <span className="text-[15px] font-bold text-[#F1F5F9]">
                    Baseline Decryption Badge Awarded
                  </span>
                </div>
                <span className="text-[13px] text-[#22D3EE] font-mono">
                  Unit 2: Deception Indicators Unlocked
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#93000A]/30 border border-[#F87171]/40 text-[#F87171] text-[13px] font-mono mt-1">
                Unit 2 remains locked until all weak concepts are mastered.
              </div>
            )}
          </Card>

          {/* Breakdown of Weak Concepts */}
          {!isPassed && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-mono text-[#F87171] uppercase tracking-wider font-bold">
                  Weak Concepts Identified ({totalQuestions - correctCount})
                </span>
                <span className="text-[12px] font-mono text-[#94A3B8]">
                  Queued in Leitner Review
                </span>
              </div>

              {proveData.questions.map((q: any, idx: number) => {
                const ans = answers[idx];
                if (ans?.isCorrect) return null;
                return (
                  <div key={q.id} className="p-4 rounded-xl bg-[#121826] border border-[#F87171]/30 flex flex-col gap-1.5">
                    <span className="text-[13px] font-mono text-[#F87171] font-semibold">
                      Diagnostic #{idx + 1} Failed
                    </span>
                    <p className="text-[15px] font-medium text-[#F1F5F9]">
                      {q.question}
                    </p>
                    <p className="text-[13px] text-[#94A3B8] mt-1 leading-relaxed">
                      <strong className="text-[#34D399]">Core Law:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {isPassed ? (
              <Button
                variant="primary"
                onClick={() => onPass(correctCount)}
                className="gap-2"
              >
                <span>Proceed to field mission (Apply)</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </Button>
            ) : (
              <Button variant="primary" onClick={handleRetry} className="gap-2">
                <span>Retry mastery assessment</span>
                <span className="material-symbols-outlined text-[20px]">
                  refresh
                </span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
