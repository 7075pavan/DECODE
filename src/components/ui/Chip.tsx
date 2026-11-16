import React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "cyan" | "amber" | "emerald" | "coral";
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const sizeStyles = {
    // Both enforce strictly >= 13px minimum label size!
    sm: "px-2.5 py-1 text-[13px]",
    md: "px-3 py-1.5 text-[13px]",
  };

  const variantStyles = {
    default:
      "bg-[#1A2233] text-[#94A3B8] border border-[#263047]",
    cyan:
      "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30",
    amber:
      "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30",
    emerald:
      "bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/30",
    coral:
      "bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/30",
  };

  const dotStyles = {
    default: "bg-[#94A3B8]",
    cyan: "bg-[#22D3EE]",
    amber: "bg-[#F59E0B]",
    emerald: "bg-[#34D399]",
    coral: "bg-[#F87171]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-mono font-medium tracking-wide select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full animate-pulse", dotStyles[variant])}
        />
      )}
      {children}
    </div>
  );
};
