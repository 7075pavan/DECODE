"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("DECODE runtime error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-[#F1F5F9] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-[#121826] border-[#EF4444]/40 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
          <span className="material-symbols-outlined text-[32px]">
            warning
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#EF4444] font-bold">
            Telemetry Anomaly
          </span>
          <h1 className="font-headline text-[22px] font-bold text-[#F1F5F9]">
            System Execution Interrupted
          </h1>
          <p className="text-[14px] text-[#94A3B8] leading-relaxed mt-1">
            An unexpected error occurred while executing this module. Your progress is cached safely in local storage.
          </p>
        </div>

        <div className="flex flex-col w-full gap-2.5 mt-2">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="w-full h-14"
          >
            Retry Module
          </Button>

          <Link href="/home" className="w-full">
            <Button
              variant="secondary"
              className="w-full h-12"
            >
              Return to Home
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
