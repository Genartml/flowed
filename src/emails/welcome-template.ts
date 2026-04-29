const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "https://flowwled.com";

export function getWelcomeEmailHtml(userName: string = "Valued User"): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Flowwled</title>
</head>
<body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:40px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="500" style="border:1px solid #eaeaea;border-radius:12px;padding:30px;background-color:#ffffff;max-width:500px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:8px 0 24px 0;">
              <img src="${baseUrl}/brand/logo-full.png" width="140" alt="Flowwled" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding:0 0 20px 0;">
              <h1 style="color:#000000;font-size:24px;font-weight:600;text-align:center;margin:0;letter-spacing:-0.5px;">
                Welcome to Flowwled
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:0 0 20px 0;">
              <p style="color:#374151;font-size:15px;line-height:24px;margin:0;">
                Hello ${userName},
              </p>
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td style="padding:0 0 16px 0;">
              <p style="color:#374151;font-size:15px;line-height:24px;margin:0;">
                We're thrilled to have you on board. Flowwled is your dedicated ledger and financial tracking application, designed to give you complete clarity over your expenses and money movement.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:16px 0 32px 0;">
              <a href="${baseUrl}/dashboard" style="background-color:#000000;border-radius:8px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;text-align:center;padding:12px 24px;display:inline-block;">
                Go to Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer text -->
          <tr>
            <td style="padding:0 0 16px 0;">
              <p style="color:#374151;font-size:15px;line-height:24px;margin:0;">
                Get started by adding your first expense or checking out your monthly summary. We're here to help you stay on top of your finances.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:10px 0;">
              <hr style="border:none;border-top:1px solid #eaeaea;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px 0 0 0;">
              <p style="color:#666666;font-size:12px;line-height:20px;margin:0;">
                Flowwled &mdash; Your Financial Clarity App
              </p>
              <p style="color:#666666;font-size:12px;line-height:20px;margin:4px 0 0 0;">
                If you have any questions, feel free to reply to this email or contact support.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
