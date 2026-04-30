"use client";

import { useMemo, useState } from "react";
import type { Expense, MoneyMovement, CockpitMetrics } from "@/lib/types";
import { runRadarScan, type RadarAlert, type AlertSeverity } from "@/lib/radar";
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Shield,
  ShieldAlert,
  Layers,
  Banknote,
  Clock,
  Copy,
  Activity,
  ChevronDown,
  ChevronUp,
  Radar,
} from "lucide-react";

interface FinancialRadarProps {
  expenses: Expense[];
  movements: MoneyMovement[];
  metrics: CockpitMetrics;
}

const SEVERITY_CONFIG: Record<AlertSeverity, {
  border: string;
  bg: string;
  badge: string;
  badgeText: string;
  text: string;
  glow: string;
}> = {
  critical: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    badge: "bg-red-500/20 border-red-500/30",
    badgeText: "text-red-400",
    text: "text-red-300",
    glow: "shadow-[0_0_20px_-5px_rgba(239,68,68,0.15)]",
  },
  warning: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/20 border-amber-500/30",
    badgeText: "text-amber-400",
    text: "text-amber-300",
    glow: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.15)]",
  },
  info: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/5",
    badge: "bg-blue-500/20 border-blue-500/30",
    badgeText: "text-blue-400",
    text: "text-blue-300",
    glow: "",
  },
  positive: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
    badge: "bg-emerald-500/20 border-emerald-500/30",
    badgeText: "text-emerald-400",
    text: "text-emerald-300",
    glow: "shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]",
  },
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  warning: "Attention",
  info: "Insight",
  positive: "All Clear",
};

function getAlertIcon(iconName: RadarAlert["icon"], severity: AlertSeverity) {
  const colorClass = SEVERITY_CONFIG[severity].badgeText;
  const props = { className: `w-5 h-5 ${colorClass}` };

  switch (iconName) {
    case "runway":
      return <Clock {...props} />;
    case "burn":
      return <TrendingUp {...props} />;
    case "concentration":
      return <Layers {...props} />;
    case "idle":
      return <Banknote {...props} />;
    case "revenue":
      return <TrendingDown {...props} />;
    case "trend":
      return <TrendingDown {...props} />;
    case "duplicate":
      return <Copy {...props} />;
    case "health":
      return <Shield {...props} />;
    default:
      return <Activity {...props} />;
  }
}

function AlertCard({ alert }: { alert: RadarAlert }) {
  const config = SEVERITY_CONFIG[alert.severity];

  return (
    <div
      className={`
        rounded-xl border p-4 transition-all duration-300
        ${config.border} ${config.bg} ${config.glow}
        hover:scale-[1.01] hover:brightness-110
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg border ${config.badge} shrink-0`}>
          {getAlertIcon(alert.icon, alert.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-zinc-100 text-sm">{alert.title}</h4>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badge} ${config.badgeText}`}>
              {SEVERITY_LABELS[alert.severity]}
            </span>
            {alert.metric && (
              <span className={`text-xs font-mono font-bold ${config.badgeText}`}>
                {alert.metric}
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed">
            {alert.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FinancialRadar({ expenses, movements, metrics }: FinancialRadarProps) {
  const [expanded, setExpanded] = useState(true);

  const alerts = useMemo(
    () => runRadarScan(expenses, movements, metrics),
    [expenses, movements, metrics]
  );

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;
  const totalIssues = criticalCount + warningCount;

  // Determine header accent
  const headerAccent = criticalCount > 0
    ? "border-red-500/30 bg-red-500/5"
    : warningCount > 0
    ? "border-amber-500/30 bg-amber-500/5"
    : "border-emerald-500/30 bg-emerald-500/5";

  const statusColor = criticalCount > 0
    ? "text-red-400"
    : warningCount > 0
    ? "text-amber-400"
    : "text-emerald-400";

  const statusIcon = criticalCount > 0
    ? <ShieldAlert className={`w-5 h-5 ${statusColor}`} />
    : warningCount > 0
    ? <AlertTriangle className={`w-5 h-5 ${statusColor}`} />
    : <Shield className={`w-5 h-5 ${statusColor}`} />;

  const statusText = criticalCount > 0
    ? `${totalIssues} Issue${totalIssues > 1 ? "s" : ""} Found`
    : warningCount > 0
    ? `${warningCount} Attention Item${warningCount > 1 ? "s" : ""}`
    : "All Systems Healthy";

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${headerAccent}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radar className={`w-5 h-5 ${statusColor}`} />
            {totalIssues > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {totalIssues}
              </span>
            )}
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Financial Health Radar</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {statusIcon}
              <span className={`text-xs font-bold ${statusColor}`}>{statusText}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest hidden sm:block">
            {alerts.length} scan{alerts.length !== 1 ? "s" : ""} complete
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>

      {/* Alerts Grid */}
      {expanded && (
        <div className="px-6 pb-6 pt-2">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
              <p className="text-zinc-500 font-medium text-sm">
                Not enough data to run a full scan yet. Add some expenses and income to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
