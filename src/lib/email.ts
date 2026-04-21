/**
 * Email service. Uses Resend when RESEND_API_KEY is set, otherwise logs to
 * the dev console so auth/premium flows remain testable without credentials.
 */

const RESEND_URL = "https://api.resend.com/emails";

export type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
};

export async function sendEmail(args: SendEmailArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = args.from ?? process.env.EMAIL_FROM ?? "TgDir <no-reply@tgdir.local>";

  if (!key) {
    console.log("[email:dev]", { to: args.to, subject: args.subject });
    console.log(args.html);
    return { ok: true, id: "dev-log" };
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "send_failed" };
  }
}

const BASE_STYLE = `font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #1f2937; max-width: 560px; margin: 0 auto; padding: 24px;`;
const BUTTON_STYLE = `display: inline-block; background: #0ea5e9; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;`;

function layout(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="background:#f3f4f6;margin:0;padding:24px;"><div style="${BASE_STYLE} background:#ffffff; border-radius:12px;"><h1 style="color:#0ea5e9;margin-top:0;">TgDir</h1><h2 style="margin-top:0;">${title}</h2>${body}<p style="color:#6b7280;font-size:12px;margin-top:32px;">TgDir — Telegram channel & group directory</p></div></body></html>`;
}

export function welcomeEmail(args: { userName: string; loginUrl: string }) {
  return layout(
    `Welcome, ${escapeHtml(args.userName)}!`,
    `<p>Thanks for joining TgDir. You can now submit channels, upgrade to premium, and track your growth.</p><p><a href="${args.loginUrl}" style="${BUTTON_STYLE}">Open your dashboard</a></p>`,
  );
}

export function verifyEmail(args: { userName: string; verifyUrl: string }) {
  return layout(
    "Verify your email",
    `<p>Hi ${escapeHtml(args.userName)}, please confirm your email to activate your account.</p><p><a href="${args.verifyUrl}" style="${BUTTON_STYLE}">Verify email</a></p><p style="color:#6b7280;font-size:12px;">This link expires in 24 hours. If you didn't register, you can ignore this email.</p>`,
  );
}

export function resetPasswordEmail(args: { userName: string; resetUrl: string }) {
  return layout(
    "Reset your password",
    `<p>Hi ${escapeHtml(args.userName)}, click the button below to set a new password.</p><p><a href="${args.resetUrl}" style="${BUTTON_STYLE}">Reset password</a></p><p style="color:#6b7280;font-size:12px;">This link expires in 1 hour.</p>`,
  );
}

export function channelApprovedEmail(args: { userName: string; channelUsername: string; channelUrl: string }) {
  return layout(
    "Your channel is now listed",
    `<p>Hi ${escapeHtml(args.userName)}, your channel @${escapeHtml(args.channelUsername)} has been approved and is live on TgDir.</p><p><a href="${args.channelUrl}" style="${BUTTON_STYLE}">View your listing</a></p>`,
  );
}

export function channelRejectedEmail(args: { userName: string; channelUsername: string; reason: string }) {
  return layout(
    "Submission needs attention",
    `<p>Hi ${escapeHtml(args.userName)}, your submission for @${escapeHtml(args.channelUsername)} couldn't be approved.</p><p><strong>Reviewer note:</strong> ${escapeHtml(args.reason)}</p><p>You can update the submission from your dashboard and resubmit.</p>`,
  );
}

export function premiumActivatedEmail(args: {
  userName: string;
  channelUsername: string;
  planName: string;
  endDate: Date;
}) {
  return layout(
    "Premium activated",
    `<p>Hi ${escapeHtml(args.userName)}, premium (${escapeHtml(args.planName)}) is now active for @${escapeHtml(args.channelUsername)}.</p><p>Your subscription is valid until <strong>${args.endDate.toDateString()}</strong>.</p>`,
  );
}

export function premiumExpiringEmail(args: {
  userName: string;
  channelUsername: string;
  endDate: Date;
  daysLeft: number;
}) {
  return layout(
    "Premium expiring soon",
    `<p>Hi ${escapeHtml(args.userName)}, the premium subscription for @${escapeHtml(args.channelUsername)} expires in ${args.daysLeft} day(s) on ${args.endDate.toDateString()}.</p><p>Renew from your dashboard to keep the gold badge and featured position.</p>`,
  );
}

export function paymentReceiptEmail(args: {
  userName: string;
  orderNumber: string;
  amount: number;
  currency: string;
  planName: string;
}) {
  return layout(
    "Payment receipt",
    `<p>Hi ${escapeHtml(args.userName)}, thanks for your order.</p><table style="width:100%;border-collapse:collapse;margin:16px 0;"><tr><td style="padding:6px 0;color:#6b7280;">Order #</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(args.orderNumber)}</td></tr><tr><td style="padding:6px 0;color:#6b7280;">Plan</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(args.planName)}</td></tr><tr><td style="padding:6px 0;color:#6b7280;">Amount</td><td style="padding:6px 0;font-weight:600;">${args.amount.toFixed(2)} ${escapeHtml(args.currency)}</td></tr></table>`,
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
