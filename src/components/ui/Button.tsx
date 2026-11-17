import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "google";
  size?: "default" | "sm";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "w-full flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F1A]";

    const sizeStyles = {
      default: "h-[56px] px-6 rounded-xl text-[16px]",
      sm: "h-[44px] px-4 rounded-lg text-[14px]",
    };

    const variantStyles = {
      // Primary: Cyan accent, dark text, exactly matching 56px design rule
      primary:
        "bg-[#22D3EE] hover:bg-[#67e8f9] text-[#0B0F1A] font-bold shadow-lg shadow-[#22D3EE]/20 hover:shadow-[#22D3EE]/30",
      // Secondary: Card surface with subtle border
      secondary:
        "bg-[#1A2233] hover:bg-[#263047] text-[#F1F5F9] border border-[#263047]",
      // Outline: Hairline border
      outline:
        "bg-transparent hover:bg-[#121826] text-[#F1F5F9] border border-[#263047] hover:border-[#22D3EE]/50",
      // Ghost: Borderless
      ghost:
        "bg-transparent hover:bg-[#121826]/60 text-[#94A3B8] hover:text-[#F1F5F9]",
      // Google Auth button: Clean white with shadow
      google:
        "bg-white hover:bg-slate-100 text-[#070A12] font-semibold shadow-lg shadow-white/5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
