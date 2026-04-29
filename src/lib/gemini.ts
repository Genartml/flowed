import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Entity, ExpenseFormData, FlowwledAnalysis, CockpitMetrics } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function getAnalysisPrompt(
  entity: Entity,
  expense: ExpenseFormData,
  metrics: CockpitMetrics,
  companyPrompt?: string
): string {
  const { totalFunds, monthlyBurn, runway, monthlyIncome } = metrics;
  
  const customContext = companyPrompt ? `\nCORE COMPANY MISSION & CONTEXT (Use this to grade the expense strictly):\n"${companyPrompt}"\n` : "";

  if (entity === "primary") {
    return `You are a strict CFO advisor for a fast-growing company.${customContext}
Monthly burn: ₹${monthlyBurn}. Monthly income: ₹${monthlyIncome}. Runway: ${runway} months. Total funds: ₹${totalFunds}.

Evaluate this business expense with zero sympathy for vanity spending. Protect cash. Think in terms of: does this directly help achieve the core company mission or generate revenue? Everything else is questionable.

Expense: ${expense.name} — ₹${expense.amount}/month
Category: ${expense.category}
Reason: ${expense.reason}
Usage process: ${expense.process}
Expected outcome in 60 days: ${expense.outcome}

Return ONLY valid JSON, no markdown, no explanation outside JSON:
{
  "label": "Invest" | "Maintain" | "Cut",
  "score": <integer 1-10>,
  "reasoning": "<2-3 direct sentences>",
  "runway_impact": "Reduces runway by approximately <X> days",
  "verdict": "Buy" | "Don't Buy" | "Buy with conditions",
  "condition": "<string or empty string>"
}`;
  }

  return `You are a personal brand strategist and finance advisor for a creator building a personal brand.${customContext}
Goals: grow audience, build thought leadership, create long-term brand equity, attract opportunities and network.
Monthly personal brand burn: ₹${monthlyBurn}. Monthly brand income: ₹${monthlyIncome}. Runway: ${runway} months. Total funds: ₹${totalFunds}.

Evaluate this personal brand expense. Think in terms of: does this directly help achieve the core mission or compound over time? Vanity purchases with no output = Cut. Learning and creation tools = usually Invest. One-time events with no follow-through = Maintain or Cut.

Expense: ${expense.name} — ₹${expense.amount}/month
Category: ${expense.category}
Reason: ${expense.reason}
Usage process: ${expense.process}
Expected outcome in 60 days: ${expense.outcome}

Return ONLY valid JSON, no markdown, no explanation outside JSON:
{
  "label": "Invest" | "Maintain" | "Cut",
  "score": <integer 1-10>,
  "reasoning": "<2-3 direct sentences, specific to personal branding>",
  "runway_impact": "Reduces brand runway by approximately <X> days",
  "verdict": "Buy" | "Don't Buy" | "Buy with conditions",
  "condition": "<string or empty string>"
}`;
}

export async function analyseExpense(
  entity: Entity,
  expense: ExpenseFormData,
  metrics: CockpitMetrics,
  companyPrompt?: string
): Promise<FlowwledAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = getAnalysisPrompt(entity, expense, metrics, companyPrompt);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse JSON from response, strip any markdown code fences
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed: FlowwledAnalysis = JSON.parse(cleaned);

  return parsed;
}

export async function generateMonthlySummary(
  entity: Entity,
  expenses: Array<{ name: string; amount: number; label: string; category: string }>,
  metrics: CockpitMetrics
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const entityContext =
    entity === "primary"
      ? "a business cockpit"
      : "a personal brand cockpit";

  const expenseList = expenses
    .map((e) => `${e.name}: ₹${e.amount}/mo [${e.label}] (${e.category})`)
    .join("\n");

  const prompt = `You are a financial advisor for ${entityContext}.
Current metrics: Burn ₹${metrics.monthlyBurn}/mo, Income ₹${metrics.monthlyIncome}/mo, Runway ${metrics.runway} months, Funds ₹${metrics.totalFunds}.

Current expenses:
${expenseList || "No expenses yet."}

Give ONE sharp, actionable insight sentence (max 30 words) about the current financial state. Be specific, not generic. Return only the sentence, nothing else.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function analyseSubscriptions(
  subscriptions: Array<{ name: string; amount: number; category: string; billingCycle: string }>
): Promise<Array<{ id: string; name: string; verdict: string; reasoning: string }>> {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const subList = subscriptions
    .map((s, i) => `[ID: sub_${i}] ${s.name}: ${s.amount} (${s.billingCycle}) - ${s.category}`)
    .join("\n");

  const prompt = `You are a strict SaaS Optimization AI auditor for a startup.
Your job is to identify redundant, unused, or overpriced subscriptions.

Here is the list of active recurring subscriptions:
${subList || "No subscriptions."}

Instructions:
1. Identify any clear overlaps (e.g. paying for Notion AND Asana AND Trello).
2. Flag anything that is notoriously an inactive or forgotten tool.
3. If a tool is essential and has no overlap, mark it as "Essential".
4. If a tool overlaps with another, mark it as "Duplicate".
5. If a tool seems unusually expensive for a typical startup, mark it as "Overpriced".
6. If a tool is likely unused or forgotten, mark it as "Dormant".

Return ONLY a valid JSON array of objects, with no markdown, no code fences, matching this EXACT schema:
[
  {
    "id": "sub_0",
    "name": "<Tool Name>",
    "verdict": "Dormant" | "Overpriced" | "Essential" | "Duplicate",
    "reasoning": "<1 sentence sharp explanation why>"
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  
  try {
    const parsed = JSON.parse(cleaned);
    // Map the pseudo-IDs back to actual random IDs for the UI
    return parsed.map((p: Record<string, unknown>) => ({ ...p, id: Math.random().toString(36).substring(7) }));
  } catch (error) {
    console.error("Failed to parse Gemini SaaS response:", cleaned, error);
    return [];
  }
}
