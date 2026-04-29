"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, Activity, TrendingUp, ChevronDown, ChevronUp, Shield, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserStat {
  id: string; email: string; createdAt: string; lastSignIn: string;
  provider: string; avatar: string | null; fullName: string | null;
  companyName: string; companyPrompt: string; totalFunds: number;
  monthlyIncome: number; baselineOverhead: number; founderName: string;
  founderRole: string; expenseCount: number; totalSpent: number;
  totalIncome: number; ledgerCount: number;
  recentExpenses: Array<{ name: string; amount: number; category: string; createdAt: string; aiVerdict?: string; aiLabel?: string; aiReasoning?: string }>;
  recentLedger: Array<{ type: string; source: string; amount: number; category: string; createdAt: string }>;
}

interface PlatformStats {
  totalUsers: number; totalExpenses: number; totalLedgerEntries: number;
  totalFundsTracked: number; totalSpentPlatform: number;
  newUsersToday: number; newUsersThisWeek: number;
}

interface AdminData { platformStats: PlatformStats; users: UserStat[]; }

const fmt = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString()}`;
};

const timeAgo = (d: string) => {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [tab, setTab] = useState<"expenses" | "ledger" | "config">("expenses");

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/data");
      if (res.status === 403) { setError("Access denied. You are not an admin."); return; }
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
      setData(await res.json());
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-zinc-100 mb-2">Access Denied</h1>
        <p className="text-zinc-400 text-sm mb-6">{error}</p>
        <Link href="/dashboard" className="text-emerald-400 font-bold text-sm hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  );

  if (!data) return null;
  const { platformStats: s, users } = data;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" /> Admin Panel
              </h1>
              <p className="text-xs text-zinc-500">Flowwled Platform Overview</p>
            </div>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-zinc-300 hover:bg-zinc-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Users", value: s.totalUsers, color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: Activity, label: "Total Expenses", value: s.totalExpenses, color: "text-red-400", bg: "bg-red-500/10" },
            { icon: DollarSign, label: "Funds Tracked", value: fmt(s.totalFundsTracked), color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icon: TrendingUp, label: "New This Week", value: s.newUsersThisWeek, color: "text-amber-400", bg: "bg-amber-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
              <p className="text-xs font-medium text-zinc-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold">All Users ({users.length})</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((user) => {
              const isExpanded = expandedUser === user.id;
              return (
                <div key={user.id}>
                  <button onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors text-left">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 shrink-0 overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user.email?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-100 truncate">{user.fullName || user.email}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email} · {user.companyName} · {user.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-emerald-400">{fmt(user.totalFunds)}</p>
                        <p className="text-xs text-zinc-500">{user.expenseCount} expenses</p>
                      </div>
                      <div className="hidden sm:block text-right">
                        <p className="text-xs text-zinc-400">Joined {timeAgo(user.createdAt)}</p>
                        <p className="text-xs text-zinc-600">Last: {timeAgo(user.lastSignIn)}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 bg-zinc-800/20 border-t border-zinc-800/50">
                      {/* User stats row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
                        {[
                          { l: "Total Funds", v: fmt(user.totalFunds) },
                          { l: "Monthly Income", v: fmt(user.monthlyIncome) },
                          { l: "Total Spent", v: fmt(user.totalSpent) },
                          { l: "Total Income", v: fmt(user.totalIncome) },
                        ].map((s) => (
                          <div key={s.l} className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                            <p className="text-lg font-bold text-zinc-100">{s.v}</p>
                            <p className="text-xs text-zinc-500">{s.l}</p>
                          </div>
                        ))}
                      </div>

                      {/* Company prompt */}
                      {user.companyPrompt && (
                        <div className="mb-4 bg-zinc-900 rounded-xl p-4 border border-zinc-700">
                          <p className="text-xs font-bold text-zinc-500 uppercase mb-1">Company Prompt / Mission</p>
                          <p className="text-sm text-zinc-300 leading-relaxed">{user.companyPrompt}</p>
                        </div>
                      )}

                      {/* Tabs */}
                      <div className="flex gap-1 mb-4 bg-zinc-900 rounded-xl p-1 border border-zinc-700 w-fit">
                        {(["expenses", "ledger", "config"] as const).map((t) => (
                          <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${tab === t ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                            {t === "expenses" ? `Expenses (${user.expenseCount})` : t === "ledger" ? `Ledger (${user.ledgerCount})` : "Config"}
                          </button>
                        ))}
                      </div>

                      {tab === "expenses" && (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {user.recentExpenses.length === 0 ? <p className="text-sm text-zinc-600 py-4">No expenses yet</p> :
                            user.recentExpenses.map((exp, i) => (
                              <div key={i} className="bg-zinc-900 rounded-xl p-4 border border-zinc-700">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-bold text-zinc-100">{exp.name}</p>
                                    <p className="text-xs text-zinc-500">{exp.category} · {new Date(exp.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-red-400">{fmt(exp.amount)}</p>
                                    {exp.aiVerdict && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${exp.aiVerdict === "Buy" ? "bg-emerald-500/15 text-emerald-400" : exp.aiVerdict === "Don't Buy" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>{exp.aiVerdict}</span>}
                                  </div>
                                </div>
                                {exp.aiReasoning && <p className="text-xs text-zinc-400 mt-2 leading-relaxed bg-zinc-800/50 p-2 rounded-lg">{exp.aiReasoning}</p>}
                              </div>
                            ))}
                        </div>
                      )}

                      {tab === "ledger" && (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {user.recentLedger.length === 0 ? <p className="text-sm text-zinc-600 py-4">No ledger entries yet</p> :
                            user.recentLedger.map((l, i) => (
                              <div key={i} className="bg-zinc-900 rounded-xl p-3 border border-zinc-700 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-zinc-200 text-sm">{l.source}</p>
                                  <p className="text-xs text-zinc-500">{l.category} · {new Date(l.createdAt).toLocaleDateString()}</p>
                                </div>
                                <p className={`font-bold ${l.type === "in" ? "text-emerald-400" : "text-red-400"}`}>
                                  {l.type === "in" ? "+" : "-"}{fmt(l.amount)}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}

                      {tab === "config" && (
                        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-700 space-y-2 text-sm">
                          {[
                            ["User ID", user.id],
                            ["Company", user.companyName],
                            ["Founder", user.founderName || "—"],
                            ["Role", user.founderRole || "—"],
                            ["Provider", user.provider],
                            ["Overhead", fmt(user.baselineOverhead)],
                            ["Joined", new Date(user.createdAt).toLocaleString()],
                            ["Last Sign In", user.lastSignIn ? new Date(user.lastSignIn).toLocaleString() : "Never"],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between">
                              <span className="text-zinc-500">{k}</span>
                              <span className="text-zinc-200 font-medium text-right max-w-[60%] truncate">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
