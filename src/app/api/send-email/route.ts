import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { FlowledEmailTemplate } from '@/emails/welcome-template';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { email, userName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'Flowled <hello@flowwled.com>',
      to: [email],
      subject: 'Welcome to Flowled!',
      react: FlowledEmailTemplate({ userName: userName || 'Valued User' }),
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
