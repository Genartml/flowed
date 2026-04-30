"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ManualExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, amount: number) => Promise<void>;
}

export function ManualExpenseModal({ open, onClose, onConfirm }: ManualExpenseModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
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
      await onConfirm(name, parseFloat(amount));
      toast.success("Expense logged successfully");
      setName("");
      setAmount("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log expense");
      toast.error("Failed to log expense");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-[400px] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-800/30">
          <h2 className="text-xl font-bold text-zinc-100">Log Manual Expense</h2>
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
              Expense Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 outline-none focus:border-red-500 font-medium transition-colors"
              placeholder="e.g. Figma Subscription"
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
              className="w-full border border-zinc-700 bg-zinc-950 text-red-400 rounded-xl px-4 py-3 outline-none focus:border-red-500 tabular-nums font-bold text-lg transition-colors"
              placeholder="e.g. 1500"
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 text-zinc-950 rounded-xl py-4 font-bold text-lg hover:bg-red-400 disabled:opacity-70 transition-colors shadow-md flex justify-center items-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}
