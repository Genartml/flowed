"use client";

import { useEntity } from "@/contexts/entity-context";
import { useClients } from "@/hooks/useClients";
import { useExpenses } from "@/hooks/useExpenses";
import { useCompanyConfig } from "@/hooks/useCompanyConfig";
import { CockpitBar, getCockpitMetrics } from "@/components/cockpit-bar";
import { ClientTracker } from "@/components/client-tracker";
import { CockpitBarSkeleton, TableSkeleton } from "@/components/skeletons";

export default function ClientsPage() {
  const { entity } = useEntity();
  const { monthlyBurn, loading: expensesLoading } = useExpenses(entity);
  const {
    clients,
    incomeSources,
    totalRevenue,
    addClient,
    deleteClient,
    addIncomeSource,
    deleteIncomeSource,
    loading: clientsLoading,
  } = useClients(entity);
  const { sharedConfig, entityConfig, updateTotalFunds, updateMonthlyIncome, loading: configLoading } =
    useCompanyConfig(entity);

  const isLoading = expensesLoading || clientsLoading || configLoading;

  const metrics = getCockpitMetrics(
    sharedConfig.totalFunds,
    monthlyBurn,
    entityConfig.monthlyIncome,
    sharedConfig.baselineOverhead
  );

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
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">
             {entity === "primary" ? "Revenue & Clients" : "Income Sources"}
          </h1>
          <p className="text-sm font-semibold text-neutral-500 uppercase mt-1">Tracking money in vs money out</p>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : (
          <ClientTracker
            clients={clients}
            incomeSources={incomeSources}
            totalRevenue={totalRevenue}
            monthlyBurn={monthlyBurn}
            onAddClient={addClient}
            onDeleteClient={deleteClient}
            onAddIncomeSource={addIncomeSource}
            onDeleteIncomeSource={deleteIncomeSource}
            teamSize={entityConfig.teamSize}
          />
        )}
      </div>
    </div>
  );
}
