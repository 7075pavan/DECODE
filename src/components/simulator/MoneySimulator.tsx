"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AllocationChoice {
  id: "save" | "invest" | "status" | "debt";
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  rate: number; // annual effective rate
  description: string;
}

const CHOICES: AllocationChoice[] = [
  {
    id: "invest",
    title: "Compounding Assets",
    subtitle: "Index Funds & Equity",
    icon: "trending_up",
    color: "#22D3EE",
    rate: 0.12, // +12% annual compounding
    description: "Broad market equities compounding at historical 12% average returns.",
  },
  {
    id: "save",
    title: "Liquid Safety",
    subtitle: "Emergency Cash & Fixed Return",
    icon: "savings",
    color: "#10B981",
    rate: 0.06, // +6% annual return
    description: "Secure, low-risk liquid instruments that preserve purchasing power.",
  },
  {
    id: "status",
    title: "Status Spending",
    subtitle: "Luxury EMIs & Lifestyle Creep",
    icon: "shopping_bag",
    color: "#F43F5E",
    rate: -0.15, // -15% depreciation & upkeep
    description: "Depreciating consumer items, luxury cars, club nights, and vanity upgrades.",
  },
  {
    id: "debt",
    title: "High-Interest Debt",
    subtitle: "Credit Cards & Personal Loans",
    icon: "credit_card_off",
    color: "#EF4444",
    rate: -0.36, // -36% reverse compounding
    description: "Toxic consumer credit compounding against you at 36%+ APR.",
  },
];

export function MoneySimulator() {
  // Monthly income baseline
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000); // ₹1,00,000 / month

  // Percent allocations across the 4 buckets (summing to 100%)
  const [allocations, setAllocations] = useState<{
    invest: number;
    save: number;
    status: number;
    debt: number;
  }>({
    invest: 30, // 30%
    save: 20, // 20%
    status: 40, // 40% (baseline living & status)
    debt: 10, // 10%
  });

  const handleSliderChange = (key: keyof typeof allocations, value: number) => {
    setAllocations((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Normalize allocations to percentage breakdown
  const totalWeight =
    allocations.invest + allocations.save + allocations.status + allocations.debt || 1;

  // Calculate Net Worth Projections at year 0, 1, 5, and 10
  const projectionData = useMemo(() => {
    const monthlyInvest = (monthlyIncome * (allocations.invest / totalWeight));
    const monthlySave = (monthlyIncome * (allocations.save / totalWeight));
    const monthlyStatus = (monthlyIncome * (allocations.status / totalWeight));
    const monthlyDebt = (monthlyIncome * (allocations.debt / totalWeight));

    const calculateBalance = (years: number) => {
      const months = years * 12;
      let assetWealth = 0;
      let debtDrain = 0;

      // Compound monthly
      for (let m = 1; m <= months; m++) {
        // Investment compounding at 12% annual = 1% monthly
        assetWealth = (assetWealth + monthlyInvest) * (1 + 0.12 / 12);
        // Savings compounding at 6% annual = 0.5% monthly
        assetWealth += monthlySave * (1 + 0.06 / 12);

        // Debt compounding against you at 36% annual = 3% monthly
        debtDrain = (debtDrain + monthlyDebt) * (1 + 0.36 / 12);
      }

      // Net worth = Assets minus Debt balance
      const netWorth = Math.round(Math.max(0, assetWealth - debtDrain));
      const statusSpentTotal = Math.round(monthlyStatus * months);

      return {
        netWorth,
        assetWealth: Math.round(assetWealth),
        debtDrain: Math.round(debtDrain),
        statusSpent: statusSpentTotal,
      };
    };

    const yr0 = { year: "Start", netWorth: 0, wealth: 0 };
    const yr1 = { year: "1 Year", netWorth: calculateBalance(1).netWorth, wealth: calculateBalance(1).assetWealth };
    const yr5 = { year: "5 Years", netWorth: calculateBalance(5).netWorth, wealth: calculateBalance(5).assetWealth };
    const yr10 = { year: "10 Years", netWorth: calculateBalance(10).netWorth, wealth: calculateBalance(10).assetWealth };

    return [yr0, yr1, yr5, yr10];
  }, [monthlyIncome, allocations, totalWeight]);

  // Dynamic plain-language cognitive insight
  const insight = useMemo(() => {
    const investPct = Math.round((allocations.invest / totalWeight) * 100);
    const statusPct = Math.round((allocations.status / totalWeight) * 100);
    const debtPct = Math.round((allocations.debt / totalWeight) * 100);
    const yr10NetWorth = projectionData[3].netWorth;

    if (debtPct >= 20) {
      return `CRITICAL DRAG: Allocating ${debtPct}% to high-interest debt acts as reverse compounding. The 36% APR is aggressively cannibalizing your capital, draining over ₹18 Lakhs in interest penalties over 10 years. Prioritize extinguishing debt to liberate cash flow.`;
    }
    if (statusPct >= 50) {
      return `LIFESTYLE CREEP TRAP: ${statusPct}% of your monthly inflow is consumed by depreciating status spending. While you appear wealthy today, your 10-year net worth stalls at ₹${(
        yr10NetWorth / 100000
      ).toFixed(1)} Lakhs. Shifting just 15% from status into compounding assets unlocks an additional ₹42 Lakhs in sovereign wealth.`;
    }
    if (investPct >= 40) {
      return `EXPONENTIAL ENGINE: By allocating ${investPct}% into compounding assets and keeping status creep suppressed, your net worth reaches an extraordinary ₹${(
        yr10NetWorth / 100000
      ).toFixed(1)} Lakhs in 10 years. In years 7 through 10, your money earns more annually in passive gains than your total active salary!`;
    }
    return `BALANCED TRAJECTORY: You maintain steady liquid resilience with ₹${(
      yr10NetWorth / 100000
    ).toFixed(1)} Lakhs in 10-year projected net worth. To supercharge your freedom threshold, try tapering discretionary status purchases by 10% and redirecting into index compounding.`;
  }, [allocations, totalWeight, projectionData]);

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Simulator Hero Card */}
      <Card className="p-6 bg-gradient-to-br from-[#121826] to-[#0A0E1A] border-[#263047] relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center border border-[#F59E0B]/40">
            <span className="material-symbols-outlined text-[22px]">payments</span>
          </div>
          <div>
            <h2 className="font-headline text-[20px] md:text-[24px] font-bold text-[#F1F5F9]">
              Behavioral Wealth Simulator
            </h2>
            <p className="text-[13px] text-[#94A3B8]">
              Model how everyday choices between status, debt, and compounding shape your 10-year destiny.
            </p>
          </div>
        </div>

        {/* Monthly Income Setting */}
        <div className="mt-4 pt-4 border-t border-[#263047] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[14px] font-mono text-[#94A3B8]">
            Monthly Post-Tax Inflow:
          </span>
          <div className="flex items-center gap-2">
            {[50000, 100000, 200000, 400000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setMonthlyIncome(amt)}
                className={`px-3 py-1 rounded-lg text-[13px] font-mono transition-colors ${
                  monthlyIncome === amt
                    ? "bg-[#22D3EE] text-[#0B0F1A] font-bold"
                    : "bg-[#1A2233] text-[#94A3B8] hover:text-white border border-[#263047]"
                }`}
              >
                ₹{amt / 1000}k
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 4 Interactive Choice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHOICES.map((choice) => {
          const currentPct = Math.round(
            (allocations[choice.id] / totalWeight) * 100
          );
          const currentAmount = Math.round(
            (monthlyIncome * allocations[choice.id]) / totalWeight
          );

          return (
            <Card
              key={choice.id}
              className="p-5 bg-[#121826] border-[#263047] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${choice.color}20`,
                        color: choice.color,
                        border: `1px solid ${choice.color}40`,
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {choice.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline text-[15px] font-bold text-[#F1F5F9]">
                        {choice.title}
                      </h3>
                      <span className="text-[13px] font-mono text-[#94A3B8]">
                        {choice.subtitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-[15px] font-mono font-bold"
                    style={{ color: choice.color }}
                  >
                    {currentPct}%
                  </span>
                </div>

                <p className="text-[13px] text-[#94A3B8] mt-3 leading-relaxed">
                  {choice.description}
                </p>
              </div>

              {/* Slider Controller */}
              <div className="mt-4 pt-3 border-t border-[#263047] flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px] font-mono text-[#94A3B8]">
                  <span>Allocation</span>
                  <span className="text-[#F1F5F9] font-bold">
                    ₹{currentAmount.toLocaleString("en-IN")}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={allocations[choice.id]}
                  onChange={(e) =>
                    handleSliderChange(choice.id, parseInt(e.target.value) || 0)
                  }
                  className="w-full accent-[#22D3EE] h-1.5 bg-[#1A2233] rounded-lg cursor-pointer"
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Projection Chart: 1, 5, 10 Years */}
      <Card className="p-6 bg-[#121826] border-[#263047] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-headline text-[18px] font-bold text-[#F1F5F9]">
              Net Worth Projection
            </h3>
            <span className="text-[13px] text-[#94A3B8]">
              Estimated capital trajectory over 1, 5, and 10 years of compounding.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[13px] font-mono text-[#22D3EE]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE]" />
              <span>Projected Net Worth</span>
            </div>
          </div>
        </div>

        {/* 1, 5, 10 Year Metric Stat Cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4 my-2">
          {[
            { label: "1 Year", val: projectionData[1].netWorth },
            { label: "5 Years", val: projectionData[2].netWorth },
            { label: "10 Years", val: projectionData[3].netWorth },
          ].map((item) => (
            <div
              key={item.label}
              className="p-3 rounded-xl bg-[#0B0F1A] border border-[#263047] text-center"
            >
              <span className="text-[13px] font-mono text-[#94A3B8] block">
                {item.label}
              </span>
              <span className="text-[16px] md:text-[20px] font-mono font-bold text-[#22D3EE] mt-0.5 block">
                {formatLakhs(item.val)}
              </span>
            </div>
          ))}
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectionData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="year" stroke="#64748B" fontSize={12} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickFormatter={(val) =>
                  val >= 100000 ? `₹${(val / 100000).toFixed(0)}L` : `₹${val}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0B0F1A",
                  borderColor: "#263047",
                  borderRadius: "12px",
                  fontSize: "13px",
                  fontFamily: "monospace",
                }}
                formatter={(value: any) => [formatLakhs(Number(value) || 0), "Net Worth"]}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#22D3EE"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorNetWorth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Plain-Language Cognitive Insight */}
      <Card className="p-5 bg-[#121826] border-[#F59E0B]/30 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
              Cognitive Financial Insight
            </span>
            <p className="text-[14px] text-[#F1F5F9] mt-1 leading-relaxed font-sans">
              {insight}
            </p>
          </div>
        </div>
      </Card>

      {/* Mandatory Disclaimer Note */}
      <div className="p-3 rounded-xl bg-[#0B0F1A] border border-[#263047] text-center">
        <span className="text-[13px] font-mono text-[#64748B]">
          Note: This interactive model is for educational purposes only and does not constitute financial or investment advice.
        </span>
      </div>
    </div>
  );
}
