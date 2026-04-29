const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXT_PUBLIC_APP_URL || "https://flowwled.com";

export function getMonthlySummaryEmailHtml(
  userName: string = "Valued User",
  month: string = "October 2024",
  totalExpenses: string = "₹45,230",
  topCategory: string = "Technology"
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ${month} Summary — Flowwled</title>
</head>
<body style="background-color:#fcfcfc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:40px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="500" style="border:1px solid #eaeaea;border-radius:12px;padding:30px;background-color:#ffffff;max-width:500px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:8px 0 32px 0;">
              <img src="${baseUrl}/brand/logo-full.png" width="120" alt="Flowwled" style="display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding:0 0 16px 0;">
              <h1 style="color:#000000;font-size:22px;font-weight:600;text-align:center;margin:0;letter-spacing:-0.5px;">
                Your ${month} Summary
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center" style="padding:0 0 24px 0;">
              <p style="color:#374151;font-size:15px;line-height:24px;margin:0;">
                Hello ${userName}, here's a quick look at your expenses for the month.
              </p>
            </td>
          </tr>

          <!-- Stats Card -->
          <tr>
            <td style="padding:0 0 24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fafafa;border:1px solid #eaeaea;border-radius:8px;padding:24px;">
                <tr>
                  <td style="padding:0 0 8px 0;">
                    <p style="color:#666666;font-size:13px;margin:0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                      Total Spent
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <p style="color:#000000;font-size:28px;margin:0;font-weight:700;letter-spacing:-0.5px;">
                      ${totalExpenses}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <hr style="border:none;border-top:1px solid #eaeaea;margin:0 0 16px 0;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 8px 0;">
                    <p style="color:#666666;font-size:13px;margin:0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">
                      Top Category
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="color:#000000;font-size:18px;margin:0;font-weight:500;">
                      ${topCategory}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:8px 0 32px 0;">
              <a href="${baseUrl}/dashboard" style="background-color:#000000;border-radius:8px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;text-align:center;padding:12px 24px;display:inline-block;">
                View Detailed Breakdown
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0;">
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
                You're receiving this email because you opted into monthly summaries.
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
