import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/utils/supabase/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize the Google AI provider with the existing GEMINI_API_KEY
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages, threadId, entity, metrics } = await req.json();

    if (!messages || !threadId || !entity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save the incoming user message to Supabase
    const lastMessage = messages[messages.length - 1];
    // In v6 SDK, message text is in parts array: [{ type: "text", text: "..." }]
    // Fallback to content for backwards compatibility
    const getTextContent = (msg: Record<string, unknown>): string => {
      if (Array.isArray(msg.parts)) {
        return msg.parts
          .filter((p: Record<string, unknown>) => p.type === "text")
          .map((p: Record<string, unknown>) => p.text)
          .join("");
      }
      return (msg.content as string) || "";
    };

    if (lastMessage.role === "user") {
      const userText = getTextContent(lastMessage);
      const { error: insertError } = await supabase.from("cfo_chat_messages").insert({
        thread_id: threadId,
        role: "user",
        content: userText,
      });
      if (insertError) {
        console.error("Failed to save user message:", insertError);
        // We log the error but still continue the chat so the user experience isn't completely broken
      }
    }

    // Build the system context using real-time metrics
    const { totalFunds, monthlyBurn, monthlyIncome, runway, baselineOverhead } = metrics || {};
    
    const systemPrompt = `You are "Flowwled CFO" (or Silvia for inspiration if you prefer, but your name is Flowwled CFO), an elite, no-nonsense AI Chief Financial Officer for startups. Your job is to help the founder make data-driven financial decisions.

CURRENT FINANCIAL STATE OF THE STARTUP:
- Total Cash in Bank: ₹${(totalFunds || 0).toLocaleString("en-IN")}
- Monthly Burn Rate: ₹${(monthlyBurn || 0).toLocaleString("en-IN")}/month
- Monthly Income/Revenue: ₹${(monthlyIncome || 0).toLocaleString("en-IN")}/month
- Current Runway: ${runway ? runway.toFixed(1) : "N/A"} months
- Baseline Overhead: ₹${(baselineOverhead || 0).toLocaleString("en-IN")}/month

RULES OF ENGAGEMENT:
1. Always use the CURRENT FINANCIAL STATE numbers when answering questions. If they ask "can I afford X?", do the math based on their Total Cash and Monthly Burn.
2. Be direct, professional, and slightly tough (like a real CFO).
3. Do NOT give generic financial advice. Always anchor your advice in THEIR numbers.
4. If a decision significantly reduces runway (e.g. below 6 months), you must raise a red flag.
5. Use clear Markdown formatting (bullet points, bold text for numbers, headers if needed).`;
    // Manually convert UIMessages to the simple format streamText expects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelMessages = messages.map((msg: any) => {
      let textContent = "";
      if (Array.isArray(msg.parts)) {
        textContent = msg.parts
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((p: any) => p.type === "text")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => p.text)
          .join("");
      } else if (typeof msg.content === "string") {
        textContent = msg.content;
      }
      return { role: msg.role as "user" | "assistant", content: textContent };
    });

    // Stream the text response from Google Gemini
    const result = await streamText({
      model: google("gemini-1.5-flash-latest"),
      system: systemPrompt,
      messages: modelMessages,
      async onFinish({ text }) {
        // Save the AI's final response to Supabase
        const { error: aiInsertError } = await supabase.from("cfo_chat_messages").insert({
          thread_id: threadId,
          role: "assistant",
          content: text,
        });

        if (aiInsertError) {
          console.error("Failed to save assistant message:", aiInsertError);
        }

        // Update the thread's updated_at timestamp
        await supabase
          .from("cfo_chat_threads")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", threadId);
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result as any).toDataStreamResponse();
  } catch (error) {
    console.error("CFO Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response." },
      { status: 500 }
    );
  }
}
