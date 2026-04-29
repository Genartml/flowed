import { resend } from "./resend";
import FlowledEmailTemplate from "@/emails/welcome-template";

export async function sendWelcomeEmail(email: string, userName?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Flowled <onboarding@resend.dev>', // Update this to your verified domain once ready
      to: [email],
      subject: 'Welcome to Flowled!',
      react: FlowledEmailTemplate({ userName }),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}
