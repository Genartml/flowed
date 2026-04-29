"use client";

import { useState } from "react";
import { useEntity } from "@/contexts/entity-context";
import { useExpenses } from "@/hooks/useExpenses";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { useClients } from "@/hooks/useClients";
import { getCockpitMetrics } from "@/components/cockpit-bar";
import { Loader2, Megaphone, Copy, CheckCircle2, AlertCircle } from "lucide-react";

export default function InvestorUpdatePage() {
  const { entity } = useEntity();
  const { expenses, monthlyBurn } = useExpenses(entity);
  const { sharedConfig, entityConfig } = useCompanyConfig(entity);
  const { clients, incomeSources } = useClients(entity);
  
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const metrics = getCockpitMetrics(
    sharedConfig.totalFunds,
    monthlyBurn,
    entityConfig.monthlyIncome,
    sharedConfig.baselineOverhead
  );

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setCopied(false);

    try {
      // Map clients/income to generic revenue sources
      const revenueSources = entity === "primary" 
        ? clients.map(c => ({ name: c.name, amount: c.retainer }))
        : incomeSources.map(i => ({ name: i.name, amount: i.amount }));

      // Format expenses for API
      const formattedExpenses = expenses.map(e => ({
        name: e.name,
        amount: e.amount,
        category: e.category
      }));

      const response = await fetch("/api/generate-investor-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metrics, 
          expenses: formattedExpenses, 
          revenueSources,
          companyPrompt: sharedConfig.companyPrompt
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate update");
      }

      const data = await response.json();
      setDraft(data.draft);
    } catch (err) {
      console.error(err);
      setError("Failed to generate the investor update. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-8 max-w-[1000px] mx-auto space-y-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-100 uppercase">Investor Updates</h1>
          <p className="text-sm font-semibold text-zinc-500 uppercase mt-1">Auto-Generate Monthly Reports</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6 py-3 bg-emerald-500 text-zinc-950 rounded-xl font-bold hover:bg-emerald-400 transition-colors uppercase text-sm shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Megaphone className="w-4 h-4" />
          )}
          {generating ? "Drafting..." : "Generate Monthly Update"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {draft ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="bg-zinc-950/50 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Draft Ready</h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
          <div className="p-6 md:p-8 overflow-auto">
            <div className="max-w-none text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap font-sans">
              {draft}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 mb-2">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-zinc-300">No Draft Generated</h3>
          <p className="text-zinc-500 font-medium max-w-md">
            Click the button above to instantly compile your live financial metrics into a professional, Silicon Valley-style investor update.
          </p>
        </div>
      )}
    </div>
  );
}
