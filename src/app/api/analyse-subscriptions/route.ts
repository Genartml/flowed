import { NextRequest, NextResponse } from "next/server";
import { analyseSubscriptions } from "@/lib/gemini";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { subscriptions } = body;

    if (!subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json(
        { error: "Subscriptions array is required" },
        { status: 400 }
      );
    }

    const recommendations = await analyseSubscriptions(subscriptions);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
