// /**
//  * AWS SES email utility (SMTP-based) for sending admin invitation emails.
//  *
//  * Why SMTP and not AWS SDK?
//  * - This project currently does not list AWS SDK packages as dependencies.
//  * - SMTP works with AWS SES using standard credentials and keeps dependencies minimal.
//  *
//  * Required environment variables:
//  * - AWS_SES_SMTP_HOST          (e.g. "email-smtp.us-east-1.amazonaws.com")
//  * - AWS_SES_SMTP_PORT          (e.g. "587" for STARTTLS or "465" for TLS)
//  * - AWS_SES_SMTP_USER          (SES SMTP username)
//  * - AWS_SES_SMTP_PASS          (SES SMTP password)
//  * - EMAIL_FROM                 (verified sender, e.g. "PESO <no-reply@yourdomain>")
//  *
//  * Optional environment variables:
//  * - EMAIL_REPLY_TO             (e.g. "support@yourdomain")
//  * - EMAIL_BCC                  (comma-separated list)
//  * - NEXT_PUBLIC_APP_URL         (used only if caller doesn't provide an invite URL; not recommended)
//  *
//  * Note:
//  * - AWS SES sandbox requires verifying recipient emails or moving account out of sandbox.
//  * - Ensure your SES identity (domain/email) is verified and the region matches the SMTP host.
//  */

// import crypto from "crypto";
// import nodemailer from "nodemailer";

// export type SendAdminInvitationEmailParams = {
//   to: string;
//   adminName: string;
//   inviteUrl: string;
//   invitedByName?: string;
//   expiresAtIso?: string;
//   isSuperadmin?: boolean;
// };

// export type SendEmailResult =
//   | { ok: true; messageId?: string; provider: "ses-smtp" }
//   | { ok: false; error: string; provider: "ses-smtp"; details?: unknown };

// function getEnv(name: string, opts?: { required?: boolean }): string | undefined {
//   const v = process.env[name];
//   if (opts?.required && (!v || !v.trim())) {
//     throw new Error(`Missing required env var: ${name}`);
//   }
//   return v?.trim();
// }

// function parsePort(value: string | undefined, fallback: number): number {
//   if (!value) return fallback;
//   const n = Number(value);
//   return Number.isFinite(n) && n > 0 ? n : fallback;
// }

// function parseAddressList(value: string | undefined): string[] {
//   if (!value) return [];
//   return value
//     .split(",")
//     .map((s) => s.trim())
//     .filter(Boolean);
// }

// function escapeHtml(input: string): string {
//   return input
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#39;");
// }

// function formatExpiry(expiresAtIso?: string): string | undefined {
//   if (!expiresAtIso) return undefined;
//   const d = new Date(expiresAtIso);
//   if (Number.isNaN(d.getTime())) return undefined;
//   return d.toLocaleString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function subjectForInvitation(isSuperadmin?: boolean): string {
//   return isSuperadmin
//     ? "You’ve been invited as a Super Admin"
//     : "You’ve been invited as an Admin";
// }

// function buildTextEmail(p: SendAdminInvitationEmailParams): string {
//   const lines: string[] = [];

//   lines.push(`Hi ${p.adminName},`);
//   lines.push("");
//   lines.push(
//     p.isSuperadmin
//       ? "You have been invited to join the PESO system as a Super Admin."
//       : "You have been invited to join the PESO system as an Admin.",
//   );

//   if (p.invitedByName) {
//     lines.push(`Invited by: ${p.invitedByName}`);
//   }

//   const expiry = formatExpiry(p.expiresAtIso);
//   if (expiry) {
//     lines.push(`This invitation expires on: ${expiry}`);
//   }

//   lines.push("");
//   lines.push("Set up your account using this link:");
//   lines.push(p.inviteUrl);
//   lines.push("");
//   lines.push("If you did not expect this invitation, you can ignore this email.");

//   return lines.join("\n");
// }

// function buildHtmlEmail(p: SendAdminInvitationEmailParams): string {
//   const safeName = escapeHtml(p.adminName);
//   const safeInviteUrl = escapeHtml(p.inviteUrl);
//   const invitedBy = p.invitedByName ? escapeHtml(p.invitedByName) : undefined;
//   const expiry = formatExpiry(p.expiresAtIso);

//   const roleLine = p.isSuperadmin
//     ? "You have been invited to join the PESO system as a <strong>Super Admin</strong>."
//     : "You have been invited to join the PESO system as an <strong>Admin</strong>.";

//   return `<!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <title>${escapeHtml(subjectForInvitation(p.isSuperadmin))}</title>
//   </head>
//   <body style="margin:0;background:#f6f7fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
//     <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7fb;padding:24px 0;">
//       <tr>
//         <td align="center">
//           <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e8ee;">
//             <tr>
//               <td style="padding:20px 24px;background:#0
