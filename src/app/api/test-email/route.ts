import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getWelcomeEmailHtml } from '@/emails/welcome-template';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Provide ?email=you@example.com" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Flowled <hello@flowwled.com>',
      to: [email],
      subject: 'Welcome to Flowled! (Test)',
      html: getWelcomeEmailHtml('Test User'),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
