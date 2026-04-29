import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/mail";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Please provide an email query param, e.g. /api/test-email?email=you@example.com" },
      { status: 400 }
    );
  }

  const result = await sendWelcomeEmail(email, "Test User");

  return NextResponse.json(result);
}
