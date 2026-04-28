"use client";

import { useState } from "react";
import { formatCurrency, calculateRunway, calculateRevenueGap } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CockpitMetrics } from "@/lib/types";

interface CockpitBarProps {
  totalFunds: number;
  monthlyBurn: number;
  monthlyIncome: number;
  baselineOverhead?: number;
  onUpdateFunds: (funds: number) => void;
  onUpdateIncome: (income: number) => void;
}

function EditableMetric({
  label,
  value,
  onSave,
  danger,
  warning,
}: {
  label: string;
  value: number;
  onSave: (value: number) => void;
  danger?: boolean;
  warning?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  const handleSave = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num >= 0) {
      onSave(num);
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-center bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm transition-all hover:border-zinc-700 cursor-pointer",
        danger && "border-red-500/30 bg-red-500/5",
        warning && "border-amber-500/30 bg-amber-500/5"
      )}
      onClick={() => {
        if (!editing) {
          setInputValue(String(value));
          setEditing(true);
        }
      }}
    >
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
        {label}
      </p>
      {editing ? (
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-full text-2xl md:text-[28px] font-black tabular-nums bg-transparent border-b border-emerald-500 outline-none mt-1 text-zinc-100"
          autoFocus
        />
      ) : (
        <p
          className={cn(
            "text-2xl md:text-[28px] font-black tabular-nums mt-1 text-zinc-100",
            danger && "text-red-400"
          )}
        >
          {formatCurrency(value)}
        </p>
      )}
    </div>
  );
}

function StaticMetric({
  label,
  formatted,
  danger,
  warning,
}: {
  label: string;
  formatted: string;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-center bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm",
        danger && "border-red-500/30 bg-red-500/5",
        warning && "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl md:text-[28px] font-black tabular-nums mt-1 text-zinc-100",
          danger && "text-red-400",
          warning && "text-amber-400"
        )}
      >
        {formatted}
      </p>
    </div>
  );
}

export function CockpitBar({
  totalFunds,
  monthlyBurn,
  monthlyIncome,
  baselineOverhead = 0,
  onUpdateFunds,
  onUpdateIncome,
}: CockpitBarProps) {
  const runway = calculateRunway(totalFunds, monthlyBurn, baselineOverhead);
  const revenueGap = calculateRevenueGap(monthlyBurn, monthlyIncome);

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 p-4 md:p-6 sticky top-0 md:top-0 z-40">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <EditableMetric
          label="Total Funds"
          value={totalFunds}
          onSave={onUpdateFunds}
        />
        <StaticMetric
          label="Monthly Burn"
          formatted={formatCurrency(monthlyBurn)}
        />
        <div className="col-span-2 md:col-span-1">
          <StaticMetric
            label="Runway"
            formatted={`${runway} months`}
            danger={runway < 3}
            warning={runway >= 3 && runway < 6}
          />
        </div>
        <EditableMetric
          label="Monthly Income"
          value={monthlyIncome}
          onSave={onUpdateIncome}
        />
        <StaticMetric
          label="Revenue Gap"
          formatted={revenueGap > 0 ? formatCurrency(revenueGap) : "₹0"}
          danger={revenueGap > 0}
        />
      </div>
    </div>
  );
}

export function getCockpitMetrics(
  totalFunds: number,
  monthlyBurn: number,
  monthlyIncome: number,
  baselineOverhead: number = 0
): CockpitMetrics {
  return {
    totalFunds,
    monthlyBurn,
    runway: calculateRunway(totalFunds, monthlyBurn, baselineOverhead),
    monthlyIncome,
    revenueGap: calculateRevenueGap(monthlyBurn, monthlyIncome),
  };
}
