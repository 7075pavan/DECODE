import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variantStyles = {
    // Standard Level 1 surface
    default: "bg-[#121826] border border-[#263047]",
    // Level 2 elevated surface
    elevated: "bg-[#1A2233] border border-[#263047]",
    // Level 2 interactive with hover and focus states
    interactive:
      "bg-[#121826] hover:bg-[#1A2233] border border-[#263047] hover:border-[#22D3EE]/40 transition-all duration-200 cursor-pointer shadow-md",
  };

  return (
    <div
      className={cn("rounded-xl p-5 text-[#F1F5F9]", variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
