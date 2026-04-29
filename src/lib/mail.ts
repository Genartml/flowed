const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "https://flowwled.com";

export async function sendWelcomeEmail(email: string, userName?: string) {
  console.log(`Attempting to send welcome email to: ${email}`);
  try {
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userName }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error sending welcome email:", result);
      return { success: false, error: result.error };
    }

    console.log("Welcome email sent successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}
