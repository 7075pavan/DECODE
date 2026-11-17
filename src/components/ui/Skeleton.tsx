import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-[#121826] via-[#1A2233] to-[#121826] bg-[length:200%_100%] border border-[#263047]/40",
        className
      )}
      {...props}
    />
  );
};
