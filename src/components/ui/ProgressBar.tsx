import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
  color?: "cyan" | "amber" | "emerald";
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  color = "cyan",
  height = "h-1.5",
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  const colorStyles = {
    cyan: "bg-[#22D3EE]",
    amber: "bg-[#F59E0B]",
    emerald: "bg-[#34D399]",
  };

  return (
    <div
      className={cn(
        "w-full bg-[#263047] rounded-full overflow-hidden",
        height,
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          colorStyles[color]
        )}
        style={{ width: `${normalizedProgress}%` }}
      />
    </div>
  );
};
