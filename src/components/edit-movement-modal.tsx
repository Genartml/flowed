"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { MoneyMovement } from "@/lib/types";

interface EditMovementModalProps {
  open: boolean;
  onClose: () => void;
  movement: MoneyMovement | null;
  onSave: (id: string, data: Partial<Pick<MoneyMovement, "source" | "amount" | "category" | "note">>) => Promise<void>;
}

export function EditMovementModal({ open, onClose, movement, onSave }: EditMovementModalProps) {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (movement) {
      setSource(movement.source);
      setAmount(movement.amount.toString());
      setCategory(movement.category);
      setNote(movement.note || "");
    }
  }, [movement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movement || !source || !amount || !category) return;

    setLoading(true);
    try {
      await onSave(movement.id, {
        source,
        amount: parseFloat(amount),
        category,
        note,
      });
      onClose();
    } catch (error) {
      alert("Error saving: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (!open || !movement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-[400px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100">Edit Ledger Entry</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase text-zinc-500 tracking-wider">
              {movement.type === "in" ? "Source" : "Recipient"}
            </label>
            <input
              type="text"
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 font-medium transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase text-zinc-500 tracking-wider">Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`w-full border border-zinc-700 bg-zinc-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 tabular-nums font-bold transition-colors ${
                movement.type === "out" ? "text-red-400" : "text-emerald-400"
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase text-zinc-500 tracking-wider">Category</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 font-medium transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase text-zinc-500 tracking-wider">Note</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none h-20 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-zinc-950 font-bold py-3.5 rounded-xl transition-colors shadow-sm bg-blue-500 hover:bg-blue-400"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
