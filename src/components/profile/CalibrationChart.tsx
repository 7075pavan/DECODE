"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/Card";

export function CalibrationChart() {
  // Calibration telemetry: Confidence wager vs observed accuracy
  const data = [
    { confidence: 50, perfect: 50, observed: 54 },
    { confidence: 60, perfect: 60, observed: 62 },
    { confidence: 70, perfect: 70, observed: 68 },
    { confidence: 80, perfect: 80, observed: 79 },
    { confidence: 90, perfect: 90, observed: 86 },
    { confidence: 100, perfect: 100, observed: 91 },
  ];

  return (
    <Card className="p-6 bg-[#121826] border-[#263047] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline text-[17px] font-bold text-[#F1F5F9]">
            Metacognitive Calibration
          </h3>
          <span className="text-[13px] text-[#94A3B8]">
            Confidence wagers vs observed accuracy (Brier score alignment).
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] font-mono text-[#10B981]">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Well Calibrated</span>
        </div>
      </div>

      <div className="h-60 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis
              dataKey="confidence"
              stroke="#64748B"
              fontSize={12}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis
              stroke="#64748B"
              fontSize={12}
              domain={[40, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0B0F1A",
                borderColor: "#263047",
                borderRadius: "12px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
              formatter={(val: any, name: any) => [
                `${val}%`,
                name === "observed" ? "Your Accuracy" : "Ideal Calibration",
              ]}
            />
            <ReferenceLine stroke="#334155" strokeDasharray="3 3" />
            {/* Ideal diagonal calibration curve */}
            <Line
              type="monotone"
              dataKey="perfect"
              stroke="#64748B"
              strokeDasharray="4 4"
              dot={false}
              name="perfect"
            />
            {/* User observed accuracy */}
            <Line
              type="monotone"
              dataKey="observed"
              stroke="#22D3EE"
              strokeWidth={3}
              dot={{ r: 4, fill: "#22D3EE", stroke: "#0B0F1A", strokeWidth: 2 }}
              name="observed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 p-3 rounded-xl bg-[#0B0F1A] border border-[#263047] flex items-center justify-between text-[13px] font-mono text-[#94A3B8]">
        <span>Brier Score: <strong className="text-[#22D3EE]">0.12 (Elite)</strong></span>
        <span>Ideal diagonal match: <strong className="text-[#10B981]">94%</strong></span>
      </div>
    </Card>
  );
}
