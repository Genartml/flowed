"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

interface MoneyInModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, amount: number, isRecurringRevenue: boolean) => Promise<void>;
}

export function MoneyInModal({ open, onClose, onConfirm }: MoneyInModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [isRecurringRevenue, setIsRecurringRevenue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) {
      setError("Name and amount are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onConfirm(name, parseFloat(amount), isRecurringRevenue);
      setName("");
      setAmount("");
      setIsRecurringRevenue(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log income");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-[400px] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-800/30">
          <h2 className="text-xl font-bold text-zinc-100">Add Money In</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
              Source / Client
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 font-medium transition-colors"
              placeholder="e.g. Acme Corp Retainer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 text-emerald-400 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 tabular-nums font-bold text-lg transition-colors"
              placeholder="e.g. 50000"
            />
          </div>

          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
            <div>
              <h4 className="text-sm font-bold text-zinc-100">Recurring MRR</h4>
              <p className="text-xs text-zinc-500">Is this a recurring monthly retainer?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isRecurringRevenue}
                onChange={(e) => setIsRecurringRevenue(e.target.checked)}
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {error && <p className="text-sm font-semibold text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-zinc-950 rounded-xl py-4 font-bold text-lg hover:bg-emerald-400 disabled:opacity-70 transition-colors shadow-md flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log Income"}
          </button>
        </form>
      </div>
    </div>
  );
}
