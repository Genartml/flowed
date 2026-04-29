import { NextRequest, NextResponse } from "next/server";
import { generateInvestorUpdate } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";
import type { CockpitMetrics } from "@/lib/types";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const {
      metrics,
      expenses,
      revenueSources,
      companyPrompt,
    }: {
      metrics: CockpitMetrics;
      expenses: Array<{ name: string; amount: number; category: string }>;
      revenueSources: Array<{ name: string; amount: number }>;
      companyPrompt?: string;
    } = body;

    if (!metrics || !expenses || !revenueSources) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const draft = await generateInvestorUpdate(metrics, expenses, revenueSources, companyPrompt);

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Gemini generation error:", error);
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
