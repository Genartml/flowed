import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Verify that the requesting user is the admin
async function verifyAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: "", ...options }); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return null;

  return user;
}

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
  }

  // Service role client — bypasses RLS
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    serviceRoleKey
  );

  try {
    // 1. Get all users from auth
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const users = authData.users.map((u) => ({
      id: u.id,
      email: u.email,
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at,
      provider: u.app_metadata?.provider || "email",
      avatar: u.user_metadata?.avatar_url || null,
      fullName: u.user_metadata?.full_name || u.user_metadata?.name || null,
    }));

    // 2. Get all configs (company info per user)
    const { data: configs } = await adminClient
      .from("config")
      .select("*")
      .eq("id", "shared");

    // 3. Get all expenses (most recent 500)
    const { data: expenses } = await adminClient
      .from("expenses")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(500);

    // 4. Get all ledger entries (most recent 500)
    const { data: ledger } = await adminClient
      .from("ledger")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(500);

    // 5. Build per-user stats
    const userStats = users.map((user) => {
      const config = configs?.find((c) => c.user_id === user.id);
      const userExpenses = expenses?.filter((e) => e.user_id === user.id) || [];
      const userLedger = ledger?.filter((l) => l.user_id === user.id) || [];
      const totalSpent = userExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalIncome = userLedger.filter((l) => l.type === "in").reduce((sum, l) => sum + Number(l.amount || 0), 0);

      return {
        ...user,
        companyName: config?.companyName || "—",
        companyPrompt: config?.companyPrompt || "",
        totalFunds: config?.totalFunds ? Number(config.totalFunds) : 0,
        monthlyIncome: config?.monthlyIncome ? Number(config.monthlyIncome) : 0,
        baselineOverhead: config?.baselineOverhead ? Number(config.baselineOverhead) : 0,
        founderName: config?.founderName || "",
        founderRole: config?.founderRole || "",
        expenseCount: userExpenses.length,
        totalSpent,
        totalIncome,
        ledgerCount: userLedger.length,
        recentExpenses: userExpenses.slice(0, 10),
        recentLedger: userLedger.slice(0, 10),
      };
    });

    // 6. Platform-wide stats
    const platformStats = {
      totalUsers: users.length,
      totalExpenses: expenses?.length || 0,
      totalLedgerEntries: ledger?.length || 0,
      totalFundsTracked: configs?.reduce((sum, c) => sum + Number(c.totalFunds || 0), 0) || 0,
      totalSpentPlatform: expenses?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0,
      newUsersToday: users.filter((u) => {
        const created = new Date(u.createdAt);
        const today = new Date();
        return created.toDateString() === today.toDateString();
      }).length,
      newUsersThisWeek: users.filter((u) => {
        const created = new Date(u.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created >= weekAgo;
      }).length,
    };

    return NextResponse.json({
      platformStats,
      users: userStats,
    });
  } catch (err) {
    console.error("Admin API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
