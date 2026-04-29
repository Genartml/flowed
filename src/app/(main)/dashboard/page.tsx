"use client";

import { useState } from "react";
import { useEntity } from "@/contexts/entity-context";
import { useExpenses } from "@/hooks/useExpenses";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { useMoneyMovement } from "@/hooks/useMoneyMovement";
import { CockpitBar, getCockpitMetrics } from "@/components/cockpit-bar";
import { MonthlySummary } from "@/components/monthly-summary";
import { MoneyMovementLog } from "@/components/money-movement-log";
import { AddExpenseModal } from "@/components/add-expense-modal";
import { MoneyInModal } from "@/components/money-in-modal";
import { ManualExpenseModal } from "@/components/manual-expense-modal";
import { CompanySettingsModal } from "@/components/company-settings-modal";
import { WhatIfModal } from "@/components/what-if-modal";
import { ProductTour } from "@/components/product-tour";
import { FinancialCharts } from "@/components/financial-charts";
import Link from "next/link";
import Image from "next/image";
import { ArrowDownLeft, ArrowUpRight, Settings2, Zap } from "lucide-react";

export default function DashboardPage() {
  const { entity } = useEntity();
  const { expenses, monthlyBurn, addExpense } = useExpenses(entity);
  const { sharedConfig, entityConfig, updateTotalFunds, updateMonthlyIncome, updateCompanySettings, completeTour } =
    useCompanyConfig(entity);
  const { movements, addMoneyIn, addMoneyOut } = useMoneyMovement(entity);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [moneyInOpen, setMoneyInOpen] = useState(false);
  const [manualExpenseOpen, setManualExpenseOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  const metrics = getCockpitMetrics(
    sharedConfig.totalFunds,
    monthlyBurn,
    entityConfig.monthlyIncome,
    sharedConfig.baselineOverhead
  );

  const showTour = sharedConfig.tourCompleted === false;

  return (
    <div className="min-h-full pb-24 page-fade-in">
      {/* Product Tour */}
      {showTour && (
        <ProductTour onComplete={completeTour} />
      )}

      <div id="tour-cockpit">
        <CockpitBar
          totalFunds={metrics.totalFunds}
          monthlyBurn={metrics.monthlyBurn}
          monthlyIncome={metrics.monthlyIncome}
          baselineOverhead={sharedConfig.baselineOverhead}
          onUpdateFunds={updateTotalFunds}
          onUpdateIncome={updateMonthlyIncome}
        />
      </div>
      
      <div className="p-4 md:p-8 max-w-[1200px] mx-auto space-y-8">
        
        {/* Action Center */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setMoneyInOpen(true)}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all p-5 rounded-2xl group text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold text-lg">Add Money In</h3>
              <p className="text-zinc-500 text-sm font-medium">Log incoming revenue</p>
            </div>
          </button>

          <button
            onClick={() => setManualExpenseOpen(true)}
            className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800/80 transition-all p-5 rounded-2xl group text-left"
          >
            <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold text-lg">Log Expense</h3>
              <p className="text-zinc-500 text-sm font-medium">Direct manual entry</p>
            </div>
          </button>

          <div id="tour-ai-analyze">
            <button
              onClick={() => setAiModalOpen(true)}
              className="w-full flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] transition-all p-5 rounded-2xl group text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform relative z-10 overflow-hidden">
                <Image src="/brand/logo-icon.png" alt="" width={40} height={40} className="w-10 h-10 object-contain" />
              </div>
              <div className="relative z-10">
                <h3 className="text-zinc-100 font-bold text-lg">AI Analyze Expense</h3>
                <p className="text-zinc-500 text-sm font-medium">Get a CFO verdict</p>
              </div>
            </button>
          </div>
        </div>

        {/* Second Row: What-If + Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div id="tour-whatif">
            <button
              onClick={() => setWhatIfOpen(true)}
              className="w-full flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-blue-500 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] transition-all p-5 rounded-2xl group text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />
              <div className="h-12 w-12 rounded-xl bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
                <Zap className="h-6 w-6" />
              </div>
              <div className="relative z-10">
                <h3 className="text-zinc-100 font-bold text-lg">What-If Simulator</h3>
                <p className="text-zinc-500 text-sm font-medium">Model any scenario with AI</p>
              </div>
            </button>
          </div>

          <div id="tour-settings">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800/80 transition-all p-5 rounded-2xl group text-left"
            >
              <div className="h-12 w-12 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-zinc-100 font-bold text-lg">Settings</h3>
                <p className="text-zinc-500 text-sm font-medium">Configure Runway</p>
              </div>
            </button>
          </div>
        </div>

        {/* Financial Charts */}
        <FinancialCharts expenses={expenses} movements={movements} metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlySummary expenses={expenses} metrics={metrics} />
          
          <div className="border border-zinc-800 bg-zinc-900 rounded-2xl shadow-sm flex flex-col h-[500px] overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-lg font-bold text-zinc-100">Recent Activity</h2>
              <Link href="/ledger" className="text-emerald-400 text-sm font-bold hover:underline">View Ledger →</Link>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MoneyMovementLog
                movements={movements}
                onAddMoneyIn={addMoneyIn}
                onAddMoneyOut={addMoneyOut}
                startingBalance={sharedConfig.totalFunds}
                hideForm
              />
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onConfirm={addExpense}
        metrics={metrics}
        companyPrompt={sharedConfig.companyPrompt}
      />
      <MoneyInModal
        open={moneyInOpen}
        onClose={() => setMoneyInOpen(false)}
        onConfirm={async (name, amount, isRecurringRevenue) => addMoneyIn(name, amount, "Revenue", isRecurringRevenue)}
      />
      <ManualExpenseModal
        open={manualExpenseOpen}
        onClose={() => setManualExpenseOpen(false)}
        onConfirm={async (name, amount) => {
          addMoneyOut(name, amount, "Expense");
        }}
      />
      <CompanySettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialName={sharedConfig.companyName || ""}
        initialPrompt={sharedConfig.companyPrompt || ""}
        initialOverhead={sharedConfig.baselineOverhead || 0}
        onSave={updateCompanySettings}
      />
      <WhatIfModal
        open={whatIfOpen}
        onClose={() => setWhatIfOpen(false)}
        metrics={metrics}
        companyPrompt={sharedConfig.companyPrompt}
      />
    </div>
  );
}
