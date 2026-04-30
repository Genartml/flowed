/**
 * Financial Health Radar — Pure analysis engine
 * Scans expenses, movements, and metrics to generate actionable alerts.
 * Runs entirely client-side with zero API calls.
 */

import type { Expense, MoneyMovement, CockpitMetrics } from "@/lib/types";

export type AlertSeverity = "critical" | "warning" | "info" | "positive";

export interface RadarAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  metric?: string;
  icon: "runway" | "burn" | "concentration" | "idle" | "revenue" | "trend" | "duplicate" | "health";
}

/**
 * Runs all radar scans and returns a prioritized list of alerts.
 */
export function runRadarScan(
  expenses: Expense[],
  movements: MoneyMovement[],
  metrics: CockpitMetrics
): RadarAlert[] {
  const alerts: RadarAlert[] = [];

  // 1. Runway check
  alerts.push(...checkRunway(metrics));

  // 2. Burn trend (month-over-month)
  alerts.push(...checkBurnTrend(movements));

  // 3. Revenue gap
  alerts.push(...checkRevenueGap(metrics));

  // 4. Category concentration
  alerts.push(...checkCategoryConcentration(expenses));

  // 5. Idle cash
  alerts.push(...checkIdleCash(metrics));

  // 6. Duplicate / overlapping subscriptions
  alerts.push(...checkDuplicateSubscriptions(expenses));

  // 7. Overall health (positive reinforcement)
  alerts.push(...checkOverallHealth(metrics, alerts));

  // Sort: critical > warning > info > positive
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
    positive: 3,
  };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

// --- Individual Scans ---

function checkRunway(metrics: CockpitMetrics): RadarAlert[] {
  const { runway } = metrics;
  if (runway < 3) {
    return [{
      id: "runway-critical",
      severity: "critical",
      title: "Runway Below 3 Months",
      description: `You have ${runway} months of runway left. This is critically low — consider cutting expenses or securing funding immediately.`,
      metric: `${runway} months`,
      icon: "runway",
    }];
  }
  if (runway < 6) {
    return [{
      id: "runway-warning",
      severity: "warning",
      title: "Runway Below 6 Months",
      description: `You have ${runway} months of runway. Start planning fundraising or revenue acceleration now to build a buffer.`,
      metric: `${runway} months`,
      icon: "runway",
    }];
  }
  return [];
}

function checkBurnTrend(movements: MoneyMovement[]): RadarAlert[] {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthBurn = movements
    .filter(m => m.type === "out" && m.createdAt.getMonth() === thisMonth && m.createdAt.getFullYear() === thisYear)
    .reduce((sum, m) => sum + m.amount, 0);

  const lastMonthBurn = movements
    .filter(m => m.type === "out" && m.createdAt.getMonth() === lastMonth && m.createdAt.getFullYear() === lastMonthYear)
    .reduce((sum, m) => sum + m.amount, 0);

  if (lastMonthBurn === 0) return []; // Not enough data

  const changePercent = ((thisMonthBurn - lastMonthBurn) / lastMonthBurn) * 100;

  if (changePercent > 30) {
    return [{
      id: "burn-spike",
      severity: "warning",
      title: "Burn Rate Spiking",
      description: `Your spend this month is up ${Math.round(changePercent)}% compared to last month. Review recent expenses for unexpected costs.`,
      metric: `+${Math.round(changePercent)}%`,
      icon: "burn",
    }];
  }

  if (changePercent < -20 && lastMonthBurn > 0) {
    return [{
      id: "burn-decrease",
      severity: "positive",
      title: "Burn Rate Decreasing",
      description: `Your spend this month is down ${Math.abs(Math.round(changePercent))}% vs last month. Great cost discipline.`,
      metric: `${Math.round(changePercent)}%`,
      icon: "trend",
    }];
  }

  return [];
}

function checkRevenueGap(metrics: CockpitMetrics): RadarAlert[] {
  const { revenueGap, monthlyBurn, monthlyIncome } = metrics;

  if (monthlyBurn === 0) return [];

  if (monthlyIncome === 0 && monthlyBurn > 0) {
    return [{
      id: "no-revenue",
      severity: "warning",
      title: "No Revenue Configured",
      description: "You haven't set any monthly income. Configure it in Settings to get accurate runway and gap calculations.",
      icon: "revenue",
    }];
  }

  if (revenueGap > 0) {
    const coveragePercent = Math.round((monthlyIncome / monthlyBurn) * 100);
    return [{
      id: "revenue-gap",
      severity: coveragePercent < 50 ? "warning" : "info",
      title: "Revenue Gap Detected",
      description: `Your income covers ${coveragePercent}% of your burn. You need ₹${revenueGap.toLocaleString("en-IN")} more per month to break even.`,
      metric: `${coveragePercent}% covered`,
      icon: "revenue",
    }];
  }

  return [];
}

function checkCategoryConcentration(expenses: Expense[]): RadarAlert[] {
  if (expenses.length < 3) return [];

  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  if (totalSpend === 0) return [];

  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  }

  const alerts: RadarAlert[] = [];
  for (const [category, amount] of Object.entries(byCategory)) {
    const percent = (amount / totalSpend) * 100;
    if (percent > 50) {
      alerts.push({
        id: `concentration-${category}`,
        severity: "warning",
        title: "High Category Concentration",
        description: `${category} accounts for ${Math.round(percent)}% of your total spend. Consider diversifying or negotiating better rates.`,
        metric: `${Math.round(percent)}%`,
        icon: "concentration",
      });
    }
  }
  return alerts;
}

function checkIdleCash(metrics: CockpitMetrics): RadarAlert[] {
  const { totalFunds, monthlyBurn } = metrics;

  if (monthlyBurn <= 0) return [];

  const monthsOfCash = totalFunds / monthlyBurn;

  if (monthsOfCash > 18) {
    return [{
      id: "idle-cash",
      severity: "info",
      title: "Excess Cash Reserves",
      description: `You have ${Math.round(monthsOfCash)} months of cash — well above the 12-18 month best practice. Consider deploying excess capital into growth initiatives.`,
      metric: `${Math.round(monthsOfCash)} months`,
      icon: "idle",
    }];
  }

  return [];
}

function checkDuplicateSubscriptions(expenses: Expense[]): RadarAlert[] {
  const subscriptions = expenses.filter(e => e.isRecurring);
  if (subscriptions.length < 2) return [];

  // Group by normalized name to find potential duplicates
  const nameGroups: Record<string, Expense[]> = {};
  for (const sub of subscriptions) {
    const key = sub.name.toLowerCase().trim().replace(/\s+/g, " ");
    if (!nameGroups[key]) nameGroups[key] = [];
    nameGroups[key].push(sub);
  }

  const alerts: RadarAlert[] = [];
  for (const [, group] of Object.entries(nameGroups)) {
    if (group.length > 1) {
      const totalCost = group.reduce((sum, e) => sum + e.amount, 0);
      alerts.push({
        id: `duplicate-${group[0].name}`,
        severity: "warning",
        title: "Possible Duplicate Subscription",
        description: `"${group[0].name}" appears ${group.length} times in your subscriptions (₹${totalCost.toLocaleString("en-IN")}/mo total). Consolidate to save money.`,
        metric: `${group.length}x`,
        icon: "duplicate",
      });
    }
  }

  // Check for overlapping categories (e.g., multiple project management tools)
  const categoryGroups: Record<string, Expense[]> = {};
  for (const sub of subscriptions) {
    const cat = sub.category;
    if (!categoryGroups[cat]) categoryGroups[cat] = [];
    categoryGroups[cat].push(sub);
  }

  for (const [category, group] of Object.entries(categoryGroups)) {
    if (group.length >= 3) {
      alerts.push({
        id: `overlap-${category}`,
        severity: "info",
        title: "Multiple Tools in Same Category",
        description: `You have ${group.length} subscriptions in "${category}". Review if any overlap in functionality and can be consolidated.`,
        metric: `${group.length} tools`,
        icon: "duplicate",
      });
    }
  }

  return alerts;
}

function checkOverallHealth(metrics: CockpitMetrics, existingAlerts: RadarAlert[]): RadarAlert[] {
  const criticalCount = existingAlerts.filter(a => a.severity === "critical").length;
  const warningCount = existingAlerts.filter(a => a.severity === "warning").length;

  if (criticalCount === 0 && warningCount === 0 && metrics.runway >= 6) {
    return [{
      id: "all-clear",
      severity: "positive",
      title: "Financial Health: Strong",
      description: "No critical issues detected. Your runway is healthy and spending patterns look good. Keep it up!",
      icon: "health",
    }];
  }

  return [];
}
