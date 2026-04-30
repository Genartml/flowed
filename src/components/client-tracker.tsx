"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Client, IncomeSource } from "@/lib/types";
import { useEntity } from "@/contexts/entity-context";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ClientTrackerProps {
  clients: Client[];
  incomeSources: IncomeSource[];
  totalRevenue: number;
  monthlyBurn: number;
  onAddClient: (name: string, retainer: number) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  onAddIncomeSource: (
    name: string,
    amount: number,
    type: string
  ) => Promise<void>;
  onDeleteIncomeSource: (id: string) => Promise<void>;
  teamSize?: number;
}

export function ClientTracker({
  clients,
  incomeSources,
  totalRevenue,
  monthlyBurn,
  onAddClient,
  onDeleteClient,
  onAddIncomeSource,
  onDeleteIncomeSource,
  teamSize = 0,
}: ClientTrackerProps) {
  const { entity } = useEntity();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("sponsorship");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    setLoading(true);
    try {
      if (entity === "primary") {
        await onAddClient(name, parseFloat(amount));
      } else {
        await onAddIncomeSource(name, parseFloat(amount), type);
      }
      toast.success(entity === "primary" ? "Client added successfully" : "Income source added successfully");
      setName("");
      setAmount("");
      setType("sponsorship");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (entity === "primary") {
        await onDeleteClient(id);
      } else {
        await onDeleteIncomeSource(id);
      }
      toast.success(entity === "primary" ? "Client removed successfully" : "Income source removed successfully");
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error("Failed to remove item");
    }
  };

  const revenueGap = monthlyBurn - totalRevenue;
  const breakEvenPercentage = Math.min((totalRevenue / (monthlyBurn || 1)) * 100, 100);

  // Genartml specific metrics
  const revenuePerTeamMember = teamSize > 0 ? totalRevenue / teamSize : 0;
  // Assume average salary is around 30k INR for calculation warning (just an example rule from spec "Red warning if ratio < 2x average salary")
  const avgSalary = 30000;
  const ratioWarning = revenuePerTeamMember < avgSalary * 2;
  const suggestedRetainer = Math.max(0, revenueGap / (clients.length + 1 || 1));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-lg font-bold text-zinc-100">
          {entity === "primary" ? "Client Tracker" : "Income Sources"}
        </h2>
        <div className="sm:text-right">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Total Revenue
          </p>
          <p className="text-2xl font-black tabular-nums text-zinc-100">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left side - List and Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 items-end bg-zinc-800/30 p-5 rounded-2xl border border-zinc-800"
          >
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                {entity === "primary" ? "Client Name" : "Source Name"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500 font-medium transition-colors"
                placeholder={entity === "primary" ? "e.g. Acme Corp" : "e.g. YouTube AdSense"}
                required
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                {entity === "primary" ? "Monthly Retainer" : "Amount (₹)"}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-zinc-700 bg-zinc-950 rounded-xl px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-emerald-500 tabular-nums font-bold transition-colors"
                placeholder="0"
                required
              />
            </div>
            {entity === "personal-brand" && (
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold mb-2 uppercase text-zinc-500 tracking-wider">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-zinc-950 text-zinc-100 font-medium transition-colors appearance-none"
                >
                  <option value="sponsorship">Sponsorship</option>
                  <option value="consulting">Consulting</option>
                  <option value="affiliate">Affiliate</option>
                  <option value="freelance">Freelance</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors w-full sm:w-auto shadow-sm"
            >
              Add
            </button>
          </form>

          <div className="border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-800/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap">Name</th>
                    {entity === "personal-brand" && (
                      <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap">Type</th>
                    )}
                    <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap">Amount</th>
                    <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 whitespace-nowrap">Added</th>
                    <th className="px-5 py-4 font-bold uppercase text-xs tracking-wider text-zinc-500 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {entity === "primary" ? (
                    clients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-zinc-500 font-medium">
                          No clients added yet.
                        </td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr key={client.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-5 py-4 font-bold text-zinc-100 whitespace-nowrap">{client.name}</td>
                          <td className="px-5 py-4 tabular-nums font-bold text-zinc-100 whitespace-nowrap">{formatCurrency(client.retainer)}</td>
                          <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(client.createdAt)}</td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )
                  ) : incomeSources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-zinc-500 font-medium">
                        No income sources added yet.
                      </td>
                    </tr>
                  ) : (
                    incomeSources.map((source) => (
                      <tr key={source.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-4 font-bold text-zinc-100 whitespace-nowrap">{source.name}</td>
                        <td className="px-5 py-4 capitalize text-zinc-400 font-medium text-xs whitespace-nowrap">
                          <span className="bg-zinc-800 px-2 py-1 rounded-md">{source.type}</span>
                        </td>
                        <td className="px-5 py-4 tabular-nums font-bold text-zinc-100 whitespace-nowrap">{formatCurrency(source.amount)}</td>
                        <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">{formatDate(source.createdAt)}</td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(source.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side - Metrics */}
        <div className="flex flex-col gap-8">
          {/* Revenue vs Burn Progress Bar */}
          <div className="bg-zinc-800/30 p-6 rounded-2xl border border-zinc-800">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Revenue vs Burn</span>
              <span className="text-xl font-black tabular-nums text-zinc-100">{Math.round(breakEvenPercentage)}%</span>
            </div>
            <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden relative mb-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${breakEvenPercentage}%` }}
              />
              {breakEvenPercentage >= 100 && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-950 tracking-widest uppercase">
                  Profitable
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-zinc-500 font-semibold tabular-nums mt-3">
              <span>{formatCurrency(totalRevenue)}</span>
              <span>Target: {formatCurrency(monthlyBurn)}</span>
            </div>
          </div>

          {entity === "primary" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-2">Agency Metrics</h3>
              
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Rev / Team Member (n={teamSize})</p>
                <p className={`text-2xl font-black tabular-nums ${ratioWarning && teamSize > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                  {teamSize > 0 ? formatCurrency(revenuePerTeamMember) : "N/A"}
                </p>
                {ratioWarning && teamSize > 0 && (
                  <div className="mt-3 bg-red-500/10 text-red-400 text-xs font-bold p-2 rounded-lg border border-red-500/20">
                    Warning: Ratio is below 2x avg salary target
                  </div>
                )}
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Suggested Min Retainer</p>
                <p className="text-2xl font-black tabular-nums text-zinc-100">
                  {formatCurrency(suggestedRetainer)}
                </p>
                <p className="text-xs font-semibold text-zinc-500 mt-2">To break even with {clients.length + 1} clients</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
