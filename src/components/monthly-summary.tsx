"use client";

import { useMemo, useEffect, useState } from "react";
import type { Expense, CockpitMetrics } from "@/lib/types";
import { formatCurrency, getRunwayStatus } from "@/lib/utils";
import { LabelPill } from "./label-pill";
import { useEntity } from "@/contexts/entity-context";
import { Sparkles } from "lucide-react";

interface MonthlySummaryProps {
  expenses: Expense[];
  metrics: CockpitMetrics;
}

export function MonthlySummary({ expenses, metrics }: MonthlySummaryProps) {
  const { entity } = useEntity();
  const [insight, setInsight] = useState<string>("Loading AI insight...");
  const [insightLoading, setInsightLoading] = useState(true);

  // Calculate breakdowns
  const breakdown = useMemo(() => {
    let invest = 0,
      maintain = 0,
      cut = 0;
    expenses.forEach((e) => {
      if (e.label === "Invest") invest += e.amount;
      if (e.label === "Maintain") maintain += e.amount;
      if (e.label === "Cut") cut += e.amount;
    });

    const total = invest + maintain + cut || 1; // avoid div by 0
    return {
      invest: { amount: invest, pct: Math.round((invest / total) * 100) },
      maintain: { amount: maintain, pct: Math.round((maintain / total) * 100) },
      cut: { amount: cut, pct: Math.round((cut / total) * 100) },
    };
  }, [expenses]);

  const cutItems = useMemo(() => expenses.filter((e) => e.label === "Cut"), [expenses]);
  const potentialSavings = cutItems.reduce((sum, e) => sum + e.amount, 0);
  const runwayStatus = getRunwayStatus(metrics.runway);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchInsight() {
      if (expenses.length === 0) {
        if (isMounted) {
          setInsight("Add expenses to generate AI insights.");
          setInsightLoading(false);
        }
        return;
      }

      try {
        setInsightLoading(true);
        const res = await fetch("/api/monthly-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity,
            expenses: expenses.map(e => ({ name: e.name, amount: e.amount, label: e.label, category: e.category })),
            metrics
          }),
        });
        const data = await res.json();
        if (isMounted) {
          setInsight(data.insight || "No insight available.");
        }
      } catch {
        if (isMounted) {
          setInsight("Unable to generate insight at this time.");
        }
      } finally {
        if (isMounted) {
          setInsightLoading(false);
        }
      }
    }

    fetchInsight();

    return () => { isMounted = false; };
  }, [expenses, metrics, entity]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-zinc-100">Monthly Summary</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase">Runway Status</span>
          <span
            className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
              runwayStatus === "Healthy"
                ? "bg-emerald-500/20 text-emerald-400"
                : runwayStatus === "Caution"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {runwayStatus}
          </span>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8">
        {/* AI Insight */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300 font-bold uppercase text-xs tracking-wider">Flowwled AI Insight</span>
          </div>
          <p className="text-sm font-medium text-zinc-300 leading-relaxed">
            {insightLoading ? (
              <span className="animate-pulse">Analyzing financial data...</span>
            ) : (
              insight
            )}
          </p>
        </div>

        {/* Burn Breakdown */}
        <div>
          <h3 className="text-sm font-bold uppercase mb-4 text-zinc-500 tracking-wider">Burn Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-24 shrink-0"><LabelPill label="Invest" /></div>
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${breakdown.invest.pct}%` }} />
              </div>
              <div className="w-24 text-right tabular-nums text-sm font-bold text-zinc-200">
                {formatCurrency(breakdown.invest.amount)}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-24 shrink-0"><LabelPill label="Maintain" /></div>
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${breakdown.maintain.pct}%` }} />
              </div>
              <div className="w-24 text-right tabular-nums text-sm font-semibold text-zinc-400">
                {formatCurrency(breakdown.maintain.amount)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-24 shrink-0"><LabelPill label="Cut" /></div>
              <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${breakdown.cut.pct}%` }} />
              </div>
              <div className="w-24 text-right tabular-nums text-sm font-bold text-red-400">
                {formatCurrency(breakdown.cut.amount)}
              </div>
            </div>
          </div>
        </div>

        {/* Cut Candidates */}
        {cutItems.length > 0 && (
          <div className="mt-auto border border-red-500/20 rounded-xl p-5 bg-red-500/5">
            <h3 className="text-sm font-bold text-red-400 uppercase mb-3 flex justify-between items-center">
              <span>Expenses to Cut</span>
              <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs">Save {formatCurrency(potentialSavings)}</span>
            </h3>
            <ul className="text-sm space-y-2">
              {cutItems.map((item) => (
                <li key={item.id} className="flex justify-between items-center text-zinc-300 font-medium">
                  <span className="truncate pr-4">{item.name}</span>
                  <span className="tabular-nums font-bold shrink-0">{formatCurrency(item.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
