"use client";

import React, { useState, useMemo } from "react";
import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LabelPill } from "./label-pill";
import { VerdictPill } from "./verdict-pill";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

type SortKey = "name" | "amount" | "category" | "label" | "score" | "verdict" | "createdAt";
type SortDir = "asc" | "desc";

export function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [labelFilter, setLabelFilter] = useState<string>("All");
  const [verdictFilter, setVerdictFilter] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let result = [...expenses];

    if (labelFilter !== "All") {
      result = result.filter((e) => e.label === labelFilter);
    }
    if (verdictFilter !== "All") {
      result = result.filter((e) => e.verdict === verdictFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        cmp = aVal.getTime() - bVal.getTime();
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [expenses, sortKey, sortDir, labelFilter, verdictFilter]);

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  const SortHeader = ({
    label,
    sortKeyName,
  }: {
    label: string;
    sortKeyName: SortKey;
  }) => (
    <th
      className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-zinc-800 select-none text-zinc-500 transition-colors whitespace-nowrap"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span className="text-emerald-400">{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0 w-16">
            Label
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Invest", "Maintain", "Cut"].map((l) => (
              <button
                key={l}
                onClick={() => setLabelFilter(l)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all shadow-sm ${
                  labelFilter === l
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-emerald-500/50 hover:text-zinc-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden xl:block w-px h-8 bg-zinc-800 shrink-0"></div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0 w-16">
            Verdict
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {["All", "Buy", "Don't Buy", "Conditional"].map((v) => (
              <button
                key={v}
                onClick={() =>
                  setVerdictFilter(
                    v === "Conditional" ? "Buy with conditions" : v
                  )
                }
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all shadow-sm ${
                  verdictFilter === (v === "Conditional" ? "Buy with conditions" : v)
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-emerald-500/50 hover:text-zinc-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-zinc-800">
              <tr>
                <SortHeader label="Name" sortKeyName="name" />
                <SortHeader label="Amount" sortKeyName="amount" />
                <SortHeader label="Category" sortKeyName="category" />
                <SortHeader label="Label" sortKeyName="label" />
                <SortHeader label="Score" sortKeyName="score" />
                <SortHeader label="Verdict" sortKeyName="verdict" />
                <SortHeader label="Date" sortKeyName="createdAt" />
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-sm text-zinc-500 font-medium"
                  >
                    No expenses found matching the criteria.
                  </td>
                </tr>
              )}
              {filtered.map((expense) => (
                <React.Fragment key={expense.id}>
                  <tr
                    className="hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                    onClick={() =>
                      setExpandedId(
                        expandedId === expense.id ? null : expense.id
                      )
                    }
                  >
                    <td className="px-4 py-4 text-sm font-bold text-zinc-100 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {expandedId === expense.id ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />}
                        {expense.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm tabular-nums font-bold text-zinc-100 whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-400 whitespace-nowrap">
                      {expense.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <LabelPill label={expense.label} />
                    </td>
                    <td className="px-4 py-4 text-sm font-bold tabular-nums text-zinc-200 whitespace-nowrap">
                      {expense.score}/10
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <VerdictPill
                        verdict={expense.verdict}
                        condition={expense.condition}
                      />
                    </td>
                    <td className="px-4 py-4 text-sm text-zinc-500 whitespace-nowrap">
                      {formatDate(expense.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      {deleteConfirmId === expense.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(expense.id);
                              toast.success("Expense removed successfully");
                              setDeleteConfirmId(null);
                            }}
                            className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md font-bold hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="text-xs bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-md font-bold hover:bg-zinc-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(expense.id);
                          }}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === expense.id && (
                    <tr className="bg-zinc-800/30">
                      <td colSpan={8} className="px-6 py-6 border-b border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="space-y-4">
                            <div>
                              <span className="font-bold text-zinc-300 block mb-1 uppercase text-xs tracking-wider">AI Reasoning</span>
                              <p className="text-zinc-400 leading-relaxed">{expense.reasoning}</p>
                            </div>
                            <div>
                              <span className="font-bold text-zinc-300 block mb-1 uppercase text-xs tracking-wider">Runway Impact</span>
                              <p className="text-zinc-400">{expense.runway_impact}</p>
                            </div>
                            {expense.condition && (
                              <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                                <span className="font-bold text-amber-400 block mb-1 uppercase text-xs tracking-wider">Condition to Buy</span>
                                <p className="text-amber-300">{expense.condition}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4 border-l border-zinc-700 pl-6">
                            {expense.reason && (
                              <div>
                                <span className="font-bold text-zinc-300 block mb-1 uppercase text-xs tracking-wider">Why (Reason)</span>
                                <p className="text-zinc-400 leading-relaxed">{expense.reason}</p>
                              </div>
                            )}
                            {expense.process && (
                              <div>
                                <span className="font-bold text-zinc-300 block mb-1 uppercase text-xs tracking-wider">Workflow Process</span>
                                <p className="text-zinc-400 leading-relaxed">{expense.process}</p>
                              </div>
                            )}
                            {expense.outcome && (
                              <div>
                                <span className="font-bold text-zinc-300 block mb-1 uppercase text-xs tracking-wider">Expected Outcome</span>
                                <p className="text-zinc-400 leading-relaxed">{expense.outcome}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            {/* Total row */}
            {filtered.length > 0 && (
              <tfoot className="bg-zinc-800/50 border-t border-zinc-700">
                <tr>
                  <td className="px-4 py-4 text-sm font-black text-zinc-100 uppercase tracking-wider">Total Output</td>
                  <td className="px-4 py-4 text-base font-black tabular-nums text-zinc-100">
                    {formatCurrency(total)}
                  </td>
                  <td colSpan={6} className="px-4 py-4" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
