import { NextRequest, NextResponse } from "next/server";
import { analyseExpense } from "@/lib/gemini";
import type { Entity, ExpenseFormData, CockpitMetrics } from "@/lib/types";

import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      entity,
      expense,
      metrics,
      companyPrompt,
    }: {
      entity: Entity;
      expense: ExpenseFormData;
      metrics: CockpitMetrics;
      companyPrompt?: string;
    } = body;

    if (!entity || !expense || !metrics) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!expense.name || !expense.amount || !expense.category) {
      return NextResponse.json(
        { error: "Expense name, amount, and category are required" },
        { status: 400 }
      );
    }

    const analysis = await analyseExpense(entity, expense, metrics, companyPrompt);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Gemini analysis error:", error);

    // Return a fallback analysis if Gemini fails
    return NextResponse.json(
      {
        error: "Analysis failed",
        fallback: {
          label: "Maintain" as const,
          score: 5,
          reasoning:
            "AI analysis unavailable. Please review this expense manually based on its alignment with your current priorities and runway.",
          runway_impact: "Unable to calculate runway impact",
          verdict: "Buy with conditions" as const,
          condition: "Review manually — AI analysis was unavailable",
        },
      },
      { status: 500 }
    );
  }
}
