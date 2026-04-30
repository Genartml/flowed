"use client";

import { useState } from "react";
import { useEntity } from "@/contexts/entity-context";
import {
  GENARTML_CATEGORIES,
  PERSONAL_BRAND_CATEGORIES,
} from "@/lib/types";
import type { ExpenseFormData, FlowwledAnalysis, CockpitMetrics } from "@/lib/types";
import { LabelPill } from "./label-pill";
import { VerdictPill } from "./verdict-pill";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: ExpenseFormData, analysis: FlowwledAnalysis) => void;
  metrics: CockpitMetrics;
  companyPrompt?: string;
}

export function AddExpenseModal({
  open,
  onClose,
  onConfirm,
  metrics,
  companyPrompt,
}: AddExpenseModalProps) {
  const { entity } = useEntity();
  const categories =
    entity === "primary" ? GENARTML_CATEGORIES : PERSONAL_BRAND_CATEGORIES;

  const [formData, setFormData] = useState<ExpenseFormData>({
    name: "",
    amount: 0,
    category: categories[0],
    reason: "",
    process: "",
    outcome: "",
    isRecurring: false,
    billingCycle: null,
  });
  const [analysis, setAnalysis] = useState<FlowwledAnalysis | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "result">("form");

  const resetForm = () => {
    setFormData({
      name: "",
      amount: 0,
      category: categories[0],
      reason: "",
      process: "",
      outcome: "",
      isRecurring: false,
      billingCycle: null,
    });
    setAnalysis(null);
    setStep("form");
    setError("");
    setAnalysing(false);
  };

  const handleSubmitForAnalysis = async () => {
    if (!formData.name || !formData.amount || !formData.category) {
      setError("Name, amount, and category are required");
      return;
    }

    setAnalysing(true);
    setError("");

    try {
      const res = await fetch("/api/analyse-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, expense: formData, metrics, companyPrompt }),
      });

      const data = await res.json();

      if (data.error && data.fallback) {
        setAnalysis(data.fallback);
      } else if (data.error) {
        setError(data.error);
        setAnalysing(false);
        return;
      } else {
        setAnalysis(data);
      }

      setStep("result");
    } catch {
      setError("Failed to analyse expense. Please try again.");
    } finally {
      setAnalysing(false);
    }
  };

  const handleConfirm = () => {
    if (analysis) {
      onConfirm(formData, analysis);
      toast.success("Expense logged successfully");
      resetForm();
      onClose();
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-[600px] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-800/30">
          <h2 className="text-xl font-bold text-zinc-100">
            {step === "form" ? "New Expense Request" : "AI Expense Analysis"}
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === "form" ? (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                  Expense Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-medium transition-colors"
                  placeholder="e.g. Notion Team Plan"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                  Amount ₹/month
                </label>
                <input
                  type="number"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full border border-zinc-700 bg-zinc-950 text-emerald-400 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 tabular-nums font-bold transition-colors"
                  placeholder="e.g. 2000"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 bg-zinc-950 text-zinc-100 font-medium transition-colors appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between sm:col-span-2 bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">Recurring Subscription</h4>
                  <p className="text-xs text-zinc-500">Is this a monthly or yearly charge?</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData({ ...formData, isRecurring: e.target.checked, billingCycle: e.target.checked ? "monthly" : null })
                    }
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Billing Cycle (Conditional) */}
              {formData.isRecurring && (
                <div className="sm:col-span-2 flex gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, billingCycle: "monthly" })}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                      formData.billingCycle === "monthly"
                        ? "bg-emerald-500 text-zinc-950"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, billingCycle: "yearly" })}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                      formData.billingCycle === "yearly"
                        ? "bg-emerald-500 text-zinc-950"
                        : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                Why are you buying this?
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 resize-none h-20 transition-colors"
                placeholder="Explain the core problem this solves..."
              />
            </div>

            {/* Process */}
            <div>
              <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                How will you use this in your workflow?
              </label>
              <textarea
                value={formData.process}
                onChange={(e) =>
                  setFormData({ ...formData, process: e.target.value })
                }
                className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 resize-none h-20 transition-colors"
                placeholder="Step-by-step usage plan..."
              />
            </div>

            {/* Expected Outcome */}
            <div>
              <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                What result do you expect in 60 days?
              </label>
              <textarea
                value={formData.outcome}
                onChange={(e) =>
                  setFormData({ ...formData, outcome: e.target.value })
                }
                className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 resize-none h-20 transition-colors"
                placeholder="Measurable ROI or outcome..."
              />
            </div>

            {error && <p className="text-sm font-semibold text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

            {/* Submit */}
            <div className="pt-2">
              <button
                onClick={handleSubmitForAnalysis}
                disabled={analysing}
                className="w-full bg-emerald-500 text-zinc-950 rounded-xl py-4 font-bold text-lg hover:bg-emerald-400 disabled:opacity-70 transition-colors shadow-md flex justify-center items-center gap-2"
              >
                {analysing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analysing with Flowwled AI...
                  </>
                ) : (
                  "Analyse Expense"
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Analysis Result */
          <div className="p-6 space-y-6">
            {analysis && (
              <>
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-700 pb-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recommendation</p>
                      <LabelPill label={analysis.label} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Score</p>
                      <span className="text-3xl font-black tabular-nums text-zinc-100">
                        {analysis.score}<span className="text-lg text-zinc-500">/10</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">CFO Reasoning</p>
                    <p className="text-zinc-300 font-medium leading-relaxed bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-sm">
                      {analysis.reasoning}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Runway Impact</p>
                      <p className="text-sm font-semibold text-zinc-200">{analysis.runway_impact}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Final Verdict</p>
                      <VerdictPill
                        verdict={analysis.verdict}
                        condition={analysis.condition}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-emerald-500 text-zinc-950 rounded-xl py-4 font-bold text-lg hover:bg-emerald-400 transition-colors shadow-md"
                  >
                    Confirm & Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl py-4 font-bold text-lg hover:bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
