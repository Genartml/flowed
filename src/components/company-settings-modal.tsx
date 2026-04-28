"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Settings2 } from "lucide-react";

interface CompanySettingsModalProps {
  open: boolean;
  onClose: () => void;
  initialName: string;
  initialPrompt: string;
  initialOverhead: number;
  onSave: (settings: { companyName: string; companyPrompt: string; baselineOverhead: number }) => Promise<void>;
}

export function CompanySettingsModal({
  open,
  onClose,
  initialName,
  initialPrompt,
  initialOverhead,
  onSave,
}: CompanySettingsModalProps) {
  const [name, setName] = useState(initialName);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [overhead, setOverhead] = useState(initialOverhead.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName);
      setPrompt(initialPrompt);
      setOverhead(initialOverhead.toString());
      setError("");
    }
  }, [open, initialName, initialPrompt, initialOverhead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !overhead) {
      setError("Company Name and Baseline Overhead are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave({
        companyName: name,
        companyPrompt: prompt,
        baselineOverhead: parseFloat(overhead) || 0,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-800/30">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" /> Company Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-zinc-300">
                Company / Brand Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Acme Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-zinc-300">
                Minimum Monthly Overhead (₹)
              </label>
              <p className="text-xs text-zinc-500 mb-2">
                The absolute minimum cash you need to keep the lights on every month. This is used to calculate your Runway.
              </p>
              <input
                type="number"
                value={overhead}
                onChange={(e) => setOverhead(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 text-emerald-400 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 tabular-nums font-bold text-lg transition-colors"
                placeholder="e.g. 50000"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800/50">
              <label className="flex items-center gap-2 text-sm font-bold mb-1 text-zinc-300 mt-4">
                Company Mission & Goal
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Context</span>
              </label>
              <p className="text-xs text-zinc-500 mb-2">
                Your AI CFO uses this to evaluate if an expense makes sense for your business goals.
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. We are a fast-growing design agency aiming to hit $10k MRR..."
                className="w-full h-32 p-4 text-sm border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl resize-none outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-zinc-950 rounded-xl py-4 font-bold text-lg hover:bg-emerald-400 disabled:opacity-70 transition-colors shadow-md flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
