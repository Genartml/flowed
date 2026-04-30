"use client";

import { useEntity } from "@/contexts/entity-context";
import { useExpenses } from "@/hooks/useExpenses";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { useMoneyMovement } from "@/hooks/useMoneyMovement";
import { CockpitBar, getCockpitMetrics } from "@/components/cockpit-bar";
import { MoneyMovementLog } from "@/components/money-movement-log";
import Papa from "papaparse";
import { formatDate, formatCurrency } from "@/lib/utils";
import { CockpitBarSkeleton, TableSkeleton } from "@/components/skeletons";
import { toast } from "sonner";

export default function LedgerPage() {
  const { entity } = useEntity();
  const { monthlyBurn, loading: expensesLoading } = useExpenses(entity);
  const { sharedConfig, entityConfig, updateTotalFunds, updateMonthlyIncome, loading: configLoading } =
    useCompanyConfig(entity);
  const { movements, addMoneyIn, addMoneyOut, loading: movementsLoading } = useMoneyMovement(entity);

  const isLoading = expensesLoading || configLoading || movementsLoading;

  const metrics = getCockpitMetrics(
    sharedConfig.totalFunds,
    monthlyBurn,
    entityConfig.monthlyIncome,
    sharedConfig.baselineOverhead
  );

  const handleExport = () => {
    // Basic CSV export for ledger
    const sorted = [...movements].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    // let currentBalance = sharedConfig.totalFunds; // Note: For perfect historical export, we'd need to trace from 0. Using current logic is an approximation based on current totalFunds and rolling backwards/forwards depending on use case. For now, simple export.
    
    const csvData = sorted.map(e => ({
      Date: formatDate(e.createdAt),
      Type: e.type.toUpperCase(),
      Source: e.source,
      Category: e.category,
      Amount: e.amount,
      Note: e.note || ""
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `flowled-ledger-${entity}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-full h-screen flex flex-col page-fade-in">
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
      
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full flex-1 flex flex-col space-y-6">
        <div className="flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase">Money Ledger</h1>
            <p className="text-sm font-semibold text-neutral-500 uppercase mt-1">Chronological transaction history</p>
          </div>
          <button
              onClick={handleExport}
              className="px-6 py-3 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-colors uppercase text-sm shadow-sm"
          >
              Export CSV
          </button>
        </div>

        <div className="flex-1 overflow-hidden min-h-[500px]">
           {isLoading ? (
             <TableSkeleton />
           ) : (
             <MoneyMovementLog 
                movements={movements} 
                onAddMoneyIn={async (source, amount, category, note) => {
                  updateTotalFunds(metrics.totalFunds + amount);
                  await addMoneyIn(source, amount, category, note);
                }} 
                onAddMoneyOut={async (source, amount, category, note) => {
                  const newBalance = metrics.totalFunds - amount;
                  updateTotalFunds(newBalance);
                  await addMoneyOut(source, amount, category, note);
                  if (newBalance < 0) {
                    toast.warning(`Balance is now negative (${formatCurrency(newBalance)}). Your funds have been overdrawn.`);
                  } else if (newBalance < metrics.monthlyBurn && metrics.monthlyBurn > 0) {
                    toast.warning(`Low funds alert — only ${formatCurrency(newBalance)} remaining. Less than 1 month of runway.`);
                  }
                }} 
                startingBalance={sharedConfig.totalFunds} 
             />
           )}
        </div>
      </div>
    </div>
  );
}
