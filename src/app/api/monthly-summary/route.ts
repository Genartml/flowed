import { NextRequest, NextResponse } from "next/server";
import { generateMonthlySummary } from "@/lib/gemini";
import type { Entity, CockpitMetrics } from "@/lib/types";

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
      expenses,
      metrics,
    }: {
      entity: Entity;
      expenses: Array<{
        name: string;
        amount: number;
        label: string;
        category: string;
      }>;
      metrics: CockpitMetrics;
    } = body;

    if (!entity || !metrics) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const insight = await generateMonthlySummary(
      entity,
      expenses || [],
      metrics
    );

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Monthly summary error:", error);
    return NextResponse.json(
      {
        insight:
          "Unable to generate AI insight. Review your expenses manually.",
      },
      { status: 500 }
    );
  }
}
