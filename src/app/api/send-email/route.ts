import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { getWelcomeEmailHtml } from '@/emails/welcome-template';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const { email, userName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Flowwled <hello@flowwled.com>',
      to: [email],
      subject: 'Welcome to Flowwled!',
      html: getWelcomeEmailHtml(userName || 'Valued User'),
    });

    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Send email failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
