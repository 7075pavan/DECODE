"use client";

import React from "react";
import Link from "next/link";
import { MoneySimulator } from "@/components/simulator/MoneySimulator";

export default function SimulatorPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-2">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-[14px] text-[#94A3B8]">
        <Link
          href="/paths/money-wealth"
          className="hover:text-[#22D3EE] transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Money & Wealth</span>
        </Link>
        <span>/</span>
        <span className="text-[#F1F5F9] font-medium">Money Simulator</span>
      </div>

      <MoneySimulator />
    </div>
  );
}
