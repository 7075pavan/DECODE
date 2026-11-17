"use client";

import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/Card";

interface SkillRadarProps {
  completedUnits?: string[];
  totalXP?: number;
}

export function SkillRadarChart({ completedUnits = [], totalXP = 0 }: SkillRadarProps) {
  // Calculate relative proficiency (0-100) per path based on completed units and base telemetry
  const data = [
    {
      subject: "Reading People",
      score: Math.min(
        100,
        30 + completedUnits.filter((u) => u.startsWith("reading-people")).length * 30
      ),
      fullMark: 100,
    },
    {
      subject: "Detective Mind",
      score: Math.min(
        100,
        25 + completedUnits.filter((u) => u.startsWith("detective-mind")).length * 30
      ),
      fullMark: 100,
    },
    {
      subject: "Mind & Mindset",
      score: Math.min(
        100,
        20 + completedUnits.filter((u) => u.startsWith("mind-and-mindset")).length * 30
      ),
      fullMark: 100,
    },
    {
      subject: "Influence",
      score: Math.min(
        100,
        25 + completedUnits.filter((u) => u.startsWith("influence-negotiation")).length * 30
      ),
      fullMark: 100,
    },
    {
      subject: "Money & Wealth",
      score: Math.min(
        100,
        20 + completedUnits.filter((u) => u.startsWith("money-wealth")).length * 30
      ),
      fullMark: 100,
    },
  ];

  return (
    <Card className="p-6 bg-[#121826] border-[#263047] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline text-[17px] font-bold text-[#F1F5F9]">
            Cognitive Skill Radar
          </h3>
          <span className="text-[13px] text-[#94A3B8]">
            Mastery distribution across all 5 cognitive disciplines.
          </span>
        </div>
        <span className="text-[12px] font-mono text-[#22D3EE] font-bold">
          5 Pillars
        </span>
      </div>

      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#1E293B" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#94A3B8"
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#334155"
              tick={false}
            />
            <Radar
              name="Proficiency"
              dataKey="score"
              stroke="#22D3EE"
              fill="#22D3EE"
              fillOpacity={0.35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B0F1A",
                borderColor: "#263047",
                borderRadius: "12px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
              formatter={(val: any) => [`${val}%`, "Proficiency"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
