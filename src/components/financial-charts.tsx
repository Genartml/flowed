"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Expense, MoneyMovement, CockpitMetrics } from "@/lib/types";
import { TrendingDown, TrendingUp, PieChart as PieIcon, Activity } from "lucide-react";

interface FinancialChartsProps {
  expenses: Expense[];
  movements: MoneyMovement[];
  metrics: CockpitMetrics;
}

const CATEGORY_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#6366f1", // indigo
];

const formatCurrency = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-bold text-zinc-400 mb-1">{label}</p>
      {payload.map((entry: { color: string; name: string; value: number }, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function FinancialCharts({ expenses, movements, metrics }: FinancialChartsProps) {
  // Monthly burn trend (last 6 months)
  const burnTrendData = useMemo(() => {
    const months: Record<string, { expenses: number; income: number }> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      months[key] = { expenses: 0, income: 0 };
    }

    // Fill expenses
    expenses.forEach((exp) => {
      const d = new Date(exp.createdAt);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (months[key]) months[key].expenses += exp.amount;
    });

    // Fill income from movements
    movements.forEach((m) => {
      const d = new Date(m.createdAt);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (months[key]) {
        if (m.type === "in") months[key].income += m.amount;
      }
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      expenses: data.expenses,
      income: data.income,
      net: data.income - data.expenses,
    }));
  }, [expenses, movements]);

  // Expense breakdown by category (pie chart)
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach((exp) => {
      const cat = exp.category || "Other";
      cats[cat] = (cats[cat] || 0) + exp.amount;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [expenses]);

  // Runway projection (area chart)
  const runwayProjection = useMemo(() => {
    const monthlyBurn = metrics.monthlyBurn || 1;
    const monthlyIncome = metrics.monthlyIncome || 0;
    const netBurn = monthlyBurn - monthlyIncome;
    let funds = metrics.totalFunds;
    const data = [{ month: "Now", funds }];

    for (let i = 1; i <= 12; i++) {
      funds = Math.max(0, funds - netBurn);
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      data.push({
        month: d.toLocaleDateString("en-US", { month: "short" }),
        funds,
      });
    }
    return data;
  }, [metrics]);

  const hasData = expenses.length > 0 || movements.length > 0;

  if (!hasData) {
    return (
      <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-8 text-center">
        <Activity className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <h3 className="text-zinc-400 font-bold text-lg mb-1">No Data Yet</h3>
        <p className="text-zinc-600 text-sm">Add expenses or income to see your financial analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold text-zinc-100">Financial Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses (Bar Chart) */}
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Revenue vs Expenses</h3>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burnTrendData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#71717a", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", fontWeight: 700, color: "#a1a1aa", paddingTop: "8px" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown (Pie Chart) */}
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <PieIcon className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Expense Breakdown</h3>
          </div>
          <div className="h-[260px] flex items-center">
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: "#27272a",
                          border: "1px solid #3f3f46",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                        itemStyle={{ color: "#fafafa" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0 max-w-[140px]">
                  {categoryData.slice(0, 6).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-zinc-400 truncate font-medium">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-zinc-600 text-sm text-center w-full">No expense categories yet</p>
            )}
          </div>
        </div>

        {/* Runway Projection (Area Chart) — full width */}
        <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">12-Month Runway Projection</h3>
            </div>
            <div className="text-xs font-bold text-zinc-500">
              At current rate: {metrics.runway.toFixed(1)} months
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={runwayProjection}>
                <defs>
                  <linearGradient id="fundsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="80%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="80%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#71717a", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="funds"
                  name="Projected Funds"
                  stroke={metrics.runway > 6 ? "#10b981" : "#ef4444"}
                  strokeWidth={2.5}
                  fill={metrics.runway > 6 ? "url(#fundsGradient)" : "url(#dangerGradient)"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
