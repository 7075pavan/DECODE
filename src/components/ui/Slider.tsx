import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number; // 50 to 100
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  helperText?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 50,
  max = 100,
  step = 5,
  label = "How sure are you?",
  helperText = "More confident = more XP if right, fewer points if wrong.",
  className,
}) => {
  // percentage fill from min to max
  const percentage = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-medium text-[#F1F5F9]">{label}</span>
        <span className="font-headline text-[24px] font-bold text-[#22D3EE]">
          {value}%
        </span>
      </div>

      <div className="relative w-full flex items-center py-2">
        {/* Track background */}
        <div className="absolute inset-x-0 h-2 bg-[#263047] rounded-full pointer-events-none" />
        {/* Active cyan fill */}
        <div
          className="absolute left-0 h-2 bg-[#22D3EE] rounded-full pointer-events-none transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
        {/* Range input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className="w-full h-2 appearance-none bg-transparent cursor-pointer relative z-10 focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#22D3EE] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0B0F1A] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-[#22D3EE]/50 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
        />
      </div>

      {/* Quick selection preset buttons */}
      <div className="flex justify-between items-center text-[13px] text-[#94A3B8] font-medium px-0.5">
        <button
          type="button"
          onClick={() => onChange(50)}
          className="hover:text-[#22D3EE] transition-colors text-left py-1 cursor-pointer"
        >
          Guessing 50%
        </button>
        <button
          type="button"
          onClick={() => onChange(75)}
          className="hover:text-[#22D3EE] transition-colors text-center py-1 cursor-pointer"
        >
          Fairly sure 75%
        </button>
        <button
          type="button"
          onClick={() => onChange(100)}
          className="hover:text-[#22D3EE] transition-colors text-right py-1 cursor-pointer"
        >
          Certain 100%
        </button>
      </div>

      {helperText && (
        <p className="text-[13px] text-[#94A3B8] leading-tight mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
};
