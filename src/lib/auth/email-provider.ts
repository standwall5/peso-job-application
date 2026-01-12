// Amazon SES Email Provider for NextAuth Magic Links
// Using AWS SDK v3

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { createTransport } from "nodemailer";

const ses = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Create nodemailer transporter with SES
const transporter = createTransport({
  SES: { ses, aws: { SendEmailCommand } },
});

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: {
  identifier: string;
  url: string;
  provider: { from: string };
}) {
  const { host } = new URL(url);
  
  // Determine if this is for applicant or admin login based on URL or email pattern
  const isAdmin = url.includes("/admin") || email.includes("@peso");
  
  const subject = isAdmin 
    ? "Sign in to PESO Admin Dashboard" 
    : "Sign in to PESO Job Portal";

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${host}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: ${isAdmin ? "#0571d3" : "#2563eb"};
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: ${isAdmin ? "#0571d3" : "#2563eb"};
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background: ${isAdmin ? "#045aa8" : "#1d4ed8"};
    }
    .footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isAdmin ? "🏛️ PESO Admin" : "💼 PESO Job Portal"}</h1>
    </div>
    <div class="content">
      <h2>Sign in to your account</h2>
      <p>Click the button below to sign in to <strong>${host}</strong></p>
      
      <div style="text-align: center;">
        <a href="${url}" class="button">Sign In</a>
      </div>

      <p>Or copy and paste this URL into your browser:</p>
      <p style="background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 14px; font-family: monospace;">
        ${url}
      </p>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong> This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
      </div>
    </div>
    <div class="footer">
      <p>This email was sent to ${email}</p>
      <p>Public Employment Service Office (PESO) | Job Application System</p>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `
Sign in to ${host}

Click the link below to sign in:
${url}

This link will expire in 24 hours.

If you didn't request this email, you can safely ignore it.

---
This email was sent to ${email}
Public Employment Service Office (PESO)
  `;

  try {
    await transporter.sendMail({
      from: provider.from,
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw error;
  }
}
