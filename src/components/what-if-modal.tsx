"use client";

import { useState } from "react";
import { X, Loader2, Zap, TrendingDown, TrendingUp, AlertTriangle, Shield, Flame } from "lucide-react";
import type { CockpitMetrics } from "@/lib/types";

interface WhatIfResult {
  title: string;
  verdict: "Safe" | "Risky" | "Dangerous";
  new_monthly_burn: number;
  new_runway_months: number;
  runway_change_months: number;
  monthly_cost: number;
  one_time_cost: number;
  break_even_action: string;
  reasoning: string;
  alternatives: string[];
}

interface WhatIfModalProps {
  open: boolean;
  onClose: () => void;
  metrics: CockpitMetrics;
  companyPrompt?: string;
}

const exampleScenarios = [
  "What if I hire a virtual assistant for ₹25,000/month?",
  "What if I buy a MacBook Pro for ₹2,50,000?",
  "What if I rent a co-working space for ₹15,000/month?",
  "What if I invest ₹1,00,000 in Facebook ads?",
  "What if I hire a full-time developer at ₹80,000/month?",
  "What if I lose my biggest client?",
];

export function WhatIfModal({ open, onClose, metrics, companyPrompt }: WhatIfModalProps) {
  const [scenario, setScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!scenario.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/what-if", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, metrics, companyPrompt }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch {
      setError("Could not analyze scenario. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScenario("");
    setResult(null);
    setError("");
    onClose();
  };

  const verdictConfig = {
    Safe: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: Shield,
      label: "Safe Move",
    },
    Risky: {
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      icon: AlertTriangle,
      label: "Proceed with Caution",
    },
    Dangerous: {
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      icon: Flame,
      label: "High Risk",
    },
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-[620px] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">What-If Simulator</h2>
              <p className="text-xs text-zinc-500 font-medium">Model any financial scenario instantly</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 rounded-xl px-3 py-2.5 border border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Funds</p>
              <p className="text-sm font-bold text-emerald-400">₹{metrics.totalFunds.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-zinc-900 rounded-xl px-3 py-2.5 border border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Burn</p>
              <p className="text-sm font-bold text-red-400">₹{metrics.monthlyBurn.toLocaleString("en-IN")}/mo</p>
            </div>
            <div className="bg-zinc-900 rounded-xl px-3 py-2.5 border border-zinc-800">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Runway</p>
              <p className="text-sm font-bold text-zinc-100">{metrics.runway.toFixed(1)} months</p>
            </div>
          </div>

          {/* Input */}
          {!result && (
            <>
              <div>
                <label className="block text-sm font-bold text-zinc-300 mb-2">Describe your scenario</label>
                <textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder='e.g. "What if I hire a VA for ₹25,000/month?"'
                  className="w-full h-28 p-4 text-sm border border-zinc-800 bg-zinc-900 text-zinc-100 rounded-xl resize-none outline-none focus:border-blue-500/50 transition-colors placeholder:text-zinc-600"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                />
              </div>

              {/* Quick Examples */}
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Quick scenarios</p>
                <div className="flex flex-wrap gap-2">
                  {exampleScenarios.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setScenario(ex)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors truncate max-w-[280px]"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-400">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-blue-400 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-zinc-300">Running simulation...</p>
                <p className="text-xs text-zinc-500 mt-1">Calculating runway impact</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Verdict Badge */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${verdictConfig[result.verdict].bg}`}>
                {(() => {
                  const VerdictIcon = verdictConfig[result.verdict].icon;
                  return <VerdictIcon className={`w-6 h-6 ${verdictConfig[result.verdict].color}`} />;
                })()}
                <div>
                  <p className={`text-sm font-black uppercase tracking-wider ${verdictConfig[result.verdict].color}`}>
                    {verdictConfig[result.verdict].label}
                  </p>
                  <p className="text-xs text-zinc-400 font-medium">{result.title}</p>
                </div>
              </div>

              {/* Impact Numbers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">New Runway</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black text-zinc-100">{result.new_runway_months.toFixed(1)}</p>
                    <span className="text-xs text-zinc-500 font-bold">months</span>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${result.runway_change_months < 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {result.runway_change_months < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                    {result.runway_change_months > 0 ? "+" : ""}{result.runway_change_months.toFixed(1)} months
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">New Monthly Burn</p>
                  <p className="text-2xl font-black text-zinc-100">₹{result.new_monthly_burn.toLocaleString("en-IN")}</p>
                  {result.monthly_cost > 0 && (
                    <p className="text-xs text-red-400 font-bold mt-1">+₹{result.monthly_cost.toLocaleString("en-IN")}/mo</p>
                  )}
                </div>
              </div>

              {result.one_time_cost > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-amber-400">
                    ⚡ One-time cost: ₹{result.one_time_cost.toLocaleString("en-IN")}
                  </p>
                </div>
              )}

              {/* Reasoning */}
              <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">CFO Analysis</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{result.reasoning}</p>
              </div>

              {/* Break Even Action */}
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">To Break Even</p>
                <p className="text-sm text-zinc-300 font-medium">{result.break_even_action}</p>
              </div>

              {/* Alternatives */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Alternatives to consider</p>
                  <div className="space-y-2">
                    {result.alternatives.map((alt, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span className="text-zinc-600 font-bold mt-0.5">{i + 1}.</span>
                        <span>{alt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Try Another */}
              <button
                onClick={() => {
                  setResult(null);
                  setScenario("");
                }}
                className="w-full text-sm font-bold text-zinc-400 hover:text-zinc-200 py-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                ↻ Try Another Scenario
              </button>
            </div>
          )}
        </div>

        {/* Footer - only show when inputting */}
        {!result && !loading && (
          <div className="px-6 pb-6">
            <button
              onClick={handleAnalyze}
              disabled={!scenario.trim() || loading}
              className="w-full bg-blue-500 text-white rounded-xl py-4 font-bold text-sm hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Simulate Scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
