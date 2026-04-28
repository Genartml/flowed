import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { scenario, metrics, companyPrompt } = await req.json();

    if (!scenario || !metrics) {
      return NextResponse.json({ error: "Missing scenario or metrics" }, { status: 400 });
    }

    const { totalFunds, monthlyBurn, monthlyIncome, runway, baselineOverhead } = metrics;

    const prompt = `You are a strict CFO simulator for a startup founder. Your job is to model "What-If" financial scenarios with precision.

CURRENT FINANCIAL STATE:
- Total Funds: ₹${totalFunds.toLocaleString("en-IN")}
- Monthly Burn: ₹${monthlyBurn.toLocaleString("en-IN")}/month
- Monthly Income: ₹${monthlyIncome.toLocaleString("en-IN")}/month
- Current Runway: ${runway.toFixed(1)} months
- Baseline Overhead: ₹${(baselineOverhead || 0).toLocaleString("en-IN")}/month
${companyPrompt ? `\nCOMPANY CONTEXT: "${companyPrompt}"` : ""}

THE FOUNDER IS ASKING:
"${scenario}"

Analyze this scenario. Calculate the exact financial impact. Be specific with numbers — don't be vague.

Return ONLY valid JSON, no markdown, no explanation outside JSON:
{
  "title": "<short 3-5 word title for this scenario>",
  "verdict": "Safe" | "Risky" | "Dangerous",
  "new_monthly_burn": <number — new total monthly burn after this change>,
  "new_runway_months": <number — new runway in months, rounded to 1 decimal>,
  "runway_change_months": <number — how many months runway changes, negative = shorter>,
  "monthly_cost": <number — the monthly cost of this specific scenario>,
  "one_time_cost": <number — one-time cost if applicable, 0 otherwise>,
  "break_even_action": "<what the founder needs to do to offset this, e.g. 'Acquire 2 more clients at ₹15,000/mo each'>",
  "reasoning": "<3-4 sentences of direct, specific CFO-level advice. Reference actual numbers. Don't be generic.>",
  "alternatives": ["<alternative option 1>", "<alternative option 2>"]
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("What-If analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
