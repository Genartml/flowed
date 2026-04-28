"use client";

import { useState, useMemo } from "react";
import type { MoneyMovement } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface MoneyMovementLogProps {
  movements: MoneyMovement[];
  onAddMoneyIn: (source: string, amount: number, category: string, note?: string) => Promise<void>;
  onAddMoneyOut: (recipient: string, amount: number, category: string, note?: string) => Promise<void>;
  startingBalance: number;
  hideForm?: boolean;
}

export function MoneyMovementLog({ movements, onAddMoneyIn, onAddMoneyOut, startingBalance, hideForm }: MoneyMovementLogProps) {
  const [activeTab, setActiveTab] = useState<"in" | "out">("in");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"All" | "This Month" | "This Week">("All");

  const sortedMovements = useMemo(() => {
    // Sort oldest to newest to calculate running balance
    const sorted = [...movements].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    let current = startingBalance;
    
    return sorted.map(m => {
      if (m.type === "in") current += m.amount;
      else current -= m.amount;
      return { ...m, runningBalance: current };
    }).reverse(); // Reverse for display (newest first)
  }, [movements, startingBalance]);

  const filteredMovements = useMemo(() => {
    if (filter === "All") return sortedMovements;
    
    const now = new Date();
    return sortedMovements.filter(m => {
      if (filter === "This Month") {
        return m.createdAt.getMonth() === now.getMonth() && m.createdAt.getFullYear() === now.getFullYear();
      }
      if (filter === "This Week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return m.createdAt >= weekAgo;
      }
      return true;
    });
  }, [sortedMovements, filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !category) return;
    
    setLoading(true);
    try {
      if (activeTab === "in") {
        await onAddMoneyIn(source, parseFloat(amount), category, note);
      } else {
        await onAddMoneyOut(source, parseFloat(amount), category, note);
      }
      setSource("");
      setAmount("");
      setCategory("");
      setNote("");
    } catch (error) {
      alert("Error saving: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${hideForm ? '' : 'lg:flex-row'} h-full gap-8`}>
      {/* Left side: Entry Form */}
      {!hideForm && (
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden sticky top-8">
          <div className="flex bg-zinc-950 p-1.5 m-2 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab("in")}
              className={`flex-1 py-2.5 text-sm font-bold text-center rounded-lg transition-all ${
                activeTab === "in" ? "bg-zinc-800 shadow-sm text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Money In
            </button>
            <button
              onClick={() => setActiveTab("out")}
              className={`flex-1 py-2.5 text-sm font-bold text-center rounded-lg transition-all ${
                activeTab === "out" ? "bg-zinc-800 shadow-sm text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Money Out
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase text-zinc-500 tracking-wider">
                {activeTab === "in" ? "Source" : "Recipient"}
              </label>
              <input
                type="text"
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 font-medium transition-colors"
                placeholder={activeTab === "in" ? "e.g. Stripe Payout" : "e.g. AWS Invoice"}
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase text-zinc-500 tracking-wider">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className={`w-full border border-zinc-700 bg-zinc-950 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 tabular-nums font-bold transition-colors ${
                  activeTab === "out" ? "text-red-400" : "text-emerald-400"
                }`}
                placeholder="0"
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
                placeholder="e.g. Software, Revenue"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase text-zinc-500 tracking-wider">Note (Optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 resize-none h-20 transition-colors"
                placeholder="Add details..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-zinc-950 font-bold py-3.5 rounded-xl transition-colors shadow-sm mt-2 ${
                activeTab === "in" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400"
              }`}
            >
              Add {activeTab === "in" ? "Money In" : "Money Out"}
            </button>
          </form>
        </div>
      </div>
      )}

      {/* Right side: Log Table */}
      <div className={`flex-1 bg-zinc-900 border-zinc-800 rounded-2xl overflow-hidden flex flex-col ${hideForm ? 'h-full border-none shadow-none' : 'h-[500px] lg:h-auto border shadow-sm'}`}>
        <div className="px-6 py-5 border-b border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 bg-zinc-900">
           <h2 className="font-bold text-lg text-zinc-100">Ledger History</h2>
           <div className="flex flex-wrap gap-2">
               {["All", "This Month", "This Week"].map(f => (
                 <button
                   key={f}
                   onClick={() => setFilter(f as "All" | "This Month" | "This Week")}
                   className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all shadow-sm ${
                     filter === f ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                   }`}
                 >
                   {f}
                 </button>
               ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm text-left">
             <thead className="bg-zinc-800/50 border-b border-zinc-800 sticky top-0 z-10">
               <tr>
                 <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap">Date</th>
                 <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap">Details</th>
                 <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap text-right">In</th>
                 <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap text-right">Out</th>
                 <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap text-right">Balance</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-zinc-800">
               {filteredMovements.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-16 text-center text-sm text-zinc-500 font-medium">
                     No movements recorded yet.
                   </td>
                 </tr>
               )}
               {filteredMovements.map(m => (
                 <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors group">
                   <td className="px-6 py-4 text-xs text-zinc-500 font-medium whitespace-nowrap">
                     {formatDate(m.createdAt)}
                   </td>
                   <td className="px-6 py-4">
                     <div className="font-bold text-zinc-100">{m.source}</div>
                     <div className="text-xs text-zinc-500 mt-0.5 flex gap-2">
                       <span className="bg-zinc-800 px-2 py-0.5 rounded-md">{m.category}</span>
                       {m.note && <span className="truncate max-w-[200px] text-zinc-400">{m.note}</span>}
                     </div>
                   </td>
                   <td className="px-6 py-4 text-right tabular-nums font-bold text-emerald-400 whitespace-nowrap">
                     {m.type === "in" ? <span className="flex items-center justify-end gap-1"><ArrowDownRight className="w-3 h-3"/>{formatCurrency(m.amount)}</span> : ""}
                   </td>
                   <td className="px-6 py-4 text-right tabular-nums font-bold text-red-400 whitespace-nowrap">
                     {m.type === "out" ? <span className="flex items-center justify-end gap-1"><ArrowUpRight className="w-3 h-3"/>{formatCurrency(m.amount)}</span> : ""}
                   </td>
                   <td className="px-6 py-4 text-right tabular-nums font-black text-zinc-100 whitespace-nowrap">
                     {formatCurrency(m.runningBalance)}
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
