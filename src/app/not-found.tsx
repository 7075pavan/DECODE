"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0B0F1A] text-[#F1F5F9] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-[#121826] border-[#263047] flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1A2233] border border-[#263047] flex items-center justify-center text-[#22D3EE]">
          <span className="material-symbols-outlined text-[32px]">
            search_off
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-mono uppercase tracking-wider text-[#22D3EE] font-bold">
            404 · Signal Lost
          </span>
          <h1 className="font-headline text-[22px] font-bold text-[#F1F5F9]">
            Dossier Not Found
          </h1>
          <p className="text-[14px] text-[#94A3B8] leading-relaxed mt-1">
            The module, path, or telemetry record you requested does not exist or has been relocated.
          </p>
        </div>

        <Link href="/home" className="w-full mt-2">
          <Button
            variant="primary"
            className="w-full h-14"
          >
            Return to Headquarters
          </Button>
        </Link>
      </Card>
    </main>
  );
}
