"use client";

import { useState } from "react";
import { useEntity } from "@/contexts/entity-context";
import { useExpenses } from "@/hooks/useExpenses";
import { Loader2, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { TableSkeleton } from "@/components/skeletons";

interface AIRecommendation {
  id: string;
  name: string;
  verdict: "Dormant" | "Overpriced" | "Essential" | "Duplicate";
  reasoning: string;
}

export default function SubscriptionsPage() {
  const { entity } = useEntity();
  const { expenses, loading: expensesLoading } = useExpenses(entity);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter for recurring expenses
  const subscriptions = expenses.filter((e) => e.isRecurring);

  const totalMonthlySaaS = subscriptions.reduce((sum, sub) => {
    // If billing cycle is yearly, divide by 12 for monthly burn equivalent
    const amount = sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount;
    return sum + amount;
  }, 0);

  const handleScan = async () => {
    if (subscriptions.length === 0) return;
    setAnalyzing(true);
    setError(null);
    setRecommendations(null);

    try {
      const response = await fetch("/api/analyse-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze subscriptions");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-8 max-w-[1200px] mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-100 uppercase">Subscriptions</h1>
          <p className="text-sm font-semibold text-zinc-500 uppercase mt-1">SaaS Optimization Audit</p>
        </div>
        <button
          onClick={handleScan}
          disabled={analyzing || subscriptions.length === 0}
          className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl font-bold hover:bg-emerald-400 transition-colors uppercase text-sm shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {analyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {analyzing ? "Scanning..." : "Run Optimization Audit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Total SaaS Spend (Mo)</p>
          <p className="text-3xl font-black tracking-tight text-zinc-100">{formatCurrency(totalMonthlySaaS)}</p>
        </div>
        <div className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Subscriptions</p>
          <p className="text-3xl font-black tracking-tight text-zinc-100">{subscriptions.length}</p>
        </div>
        <div className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800 shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Optimization Status</p>
          {recommendations ? (
             <p className="text-3xl font-black tracking-tight text-amber-500">{recommendations.filter(r => r.verdict !== "Essential").length} Alerts</p>
          ) : (
             <p className="text-3xl font-black tracking-tight text-zinc-600">Unscanned</p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      {recommendations && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-100">AI Optimization Alerts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const isAlert = rec.verdict !== "Essential";
              return (
                <div key={rec.id} className={`p-5 rounded-xl border ${isAlert ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${isAlert ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {isAlert ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-100">{rec.name} <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-900 ml-2 shadow-sm border border-zinc-800 text-zinc-300">{rec.verdict}</span></h3>
                      <p className={`text-sm mt-2 font-medium leading-relaxed ${isAlert ? 'text-amber-400' : 'text-emerald-400'}`}>{rec.reasoning}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-zinc-100">Active Subscriptions</h2>
        {expensesLoading ? (
          <TableSkeleton />
        ) : subscriptions.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
            <p className="text-zinc-500 font-medium">No recurring subscriptions found.</p>
          </div>
        ) : (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <th className="p-4 font-bold">Service Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Billing Cycle</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 text-zinc-200">{sub.name}</td>
                    <td className="p-4 text-zinc-500">{sub.category}</td>
                    <td className="p-4 text-zinc-500 capitalize">{sub.billingCycle || "Monthly"}</td>
                    <td className="p-4 text-right font-bold tabular-nums text-zinc-200">
                      {formatCurrency(sub.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
