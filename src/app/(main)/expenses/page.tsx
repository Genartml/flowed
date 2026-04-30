"use client";

import { useState } from "react";
import { useEntity } from "@/contexts/entity-context";
import { useExpenses } from "@/hooks/useExpenses";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { useMoneyMovement } from "@/hooks/useMoneyMovement";
import { CockpitBar, getCockpitMetrics } from "@/components/cockpit-bar";
import { ExpenseTable } from "@/components/expense-table";
import { AddExpenseModal } from "@/components/add-expense-modal";
import Papa from "papaparse";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CockpitBarSkeleton, TableSkeleton } from "@/components/skeletons";
import { toast } from "sonner";

export default function ExpensesPage() {
  const { entity } = useEntity();
  const { expenses, monthlyBurn, addExpense, deleteExpense, loading: expensesLoading } = useExpenses(entity);
  const { sharedConfig, entityConfig, updateTotalFunds, updateMonthlyIncome, loading: configLoading } =
    useCompanyConfig(entity);
  const { addMoneyOut } = useMoneyMovement(entity);
  const [modalOpen, setModalOpen] = useState(false);

  const isLoading = expensesLoading || configLoading;

  const metrics = getCockpitMetrics(
    sharedConfig.totalFunds,
    monthlyBurn,
    entityConfig.monthlyIncome,
    sharedConfig.baselineOverhead
  );

  const handleExport = () => {
    const csvData = expenses.map(e => ({
      Date: formatDate(e.createdAt),
      Name: e.name,
      Amount: e.amount,
      Category: e.category,
      Label: e.label,
      Score: e.score,
      Verdict: e.verdict,
      Condition: e.condition || "",
      Reason: e.reason || "",
      Outcome: e.outcome || ""
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `flowled-expenses-${entity}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-full pb-24 page-fade-in">
      {isLoading ? (
        <CockpitBarSkeleton />
      ) : (
        <CockpitBar
          totalFunds={metrics.totalFunds}
          monthlyBurn={metrics.monthlyBurn}
          monthlyIncome={metrics.monthlyIncome}
          baselineOverhead={sharedConfig.baselineOverhead}
          onUpdateFunds={updateTotalFunds}
          onUpdateIncome={updateMonthlyIncome}
        />
      )}
      
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Expenses</h1>
            <p className="text-sm font-semibold text-neutral-500 uppercase mt-1">Full Tracking & Analysis</p>
          </div>
          <div className="flex gap-4">
             <button
              onClick={handleExport}
              className="px-6 py-3 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-colors uppercase text-sm shadow-sm"
            >
              Export CSV
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors uppercase text-sm shadow-sm"
            >
              + Add Expense
            </button>
        </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <ExpenseTable expenses={expenses} onDelete={deleteExpense} />
        )}
      </div>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        metrics={metrics}
        companyPrompt={sharedConfig.companyPrompt}
        onConfirm={async (data, analysis) => {
          const newBalance = metrics.totalFunds - data.amount;
          updateTotalFunds(newBalance);
          await addMoneyOut(data.name, data.amount, data.category, data.reason, false);
          await addExpense(data, analysis);
          if (newBalance < 0) {
            toast.warning(`Balance is now negative (${formatCurrency(newBalance)}). Your funds have been overdrawn.`);
          } else if (newBalance < metrics.monthlyBurn && metrics.monthlyBurn > 0) {
            toast.warning(`Low funds alert — only ${formatCurrency(newBalance)} remaining. Less than 1 month of runway.`);
          }
        }}
      />
    </div>
  );
}
