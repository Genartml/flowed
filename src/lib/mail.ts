import { Resend } from 'resend';
import { getWelcomeEmailHtml } from '@/emails/welcome-template';

export async function sendWelcomeEmail(email: string, userName?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set in environment variables.");
    return { success: false, error: "Missing API Key" };
  }

  const resend = new Resend(apiKey);
  console.log(`Attempting to send welcome email to: ${email}`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Flowwled <hello@flowwled.com>',
      to: [email],
      subject: 'Welcome to Flowwled!',
      html: getWelcomeEmailHtml(userName || 'Valued User'),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    console.log("Welcome email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}
