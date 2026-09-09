import { env } from "../config/env.js";

const BRAND_COLOR = "#1f845a";

function wrap(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_COLOR};padding:20px 32px;">
                <span style="color:#fff;font-size:18px;font-weight:700;">EndlessBacklog</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#14171a;font-size:15px;line-height:1.6;">
                <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(url: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${url}" style="background:${BRAND_COLOR};color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${label}</a></p>`;
}

export function verifyEmailTemplate(token: string): { subject: string; html: string } {
  const url = `${env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
  return {
    subject: "Verify your EndlessBacklog email",
    html: wrap(
      "Confirm your email address",
      `<p>Welcome to EndlessBacklog! Click below to verify your email and finish setting up your account.</p>${button(
        url,
        "Verify email",
      )}<p style="color:#6b6f76;font-size:13px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>`,
    ),
  };
}

export function passwordResetTemplate(token: string): { subject: string; html: string } {
  const url = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  return {
    subject: "Reset your EndlessBacklog password",
    html: wrap(
      "Reset your password",
      `<p>We received a request to reset your password. Click below to choose a new one.</p>${button(
        url,
        "Reset password",
      )}<p style="color:#6b6f76;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
    ),
  };
}

export function workspaceInviteTemplate(params: {
  token: string;
  workspaceName: string;
  inviterName: string;
}): { subject: string; html: string } {
  const url = `${env.FRONTEND_URL}/invite?token=${encodeURIComponent(params.token)}`;
  return {
    subject: `${params.inviterName} invited you to "${params.workspaceName}" on EndlessBacklog`,
    html: wrap(
      "You've been invited",
      `<p><strong>${params.inviterName}</strong> invited you to join the <strong>${params.workspaceName}</strong> workspace on EndlessBacklog.</p>${button(
        url,
        "Accept invite",
      )}`,
    ),
  };
}

export function dueSoonTemplate(params: { cardTitle: string; boardName: string; cardUrl: string }): {
  subject: string;
  html: string;
} {
  return {
    subject: `Due soon: ${params.cardTitle}`,
    html: wrap(
      "A card you're on is due soon",
      `<p><strong>${params.cardTitle}</strong> on board <strong>${params.boardName}</strong> is coming due.</p>${button(
        params.cardUrl,
        "Open card",
      )}`,
    ),
  };
}

export function digestTemplate(params: { unreadCount: number }): { subject: string; html: string } {
  return {
    subject: `Your EndlessBacklog digest: ${params.unreadCount} unread notifications`,
    html: wrap(
      "Here's what you missed",
      `<p>You have <strong>${params.unreadCount}</strong> unread notifications.</p>${button(
        `${env.FRONTEND_URL}/notifications`,
        "View notifications",
      )}`,
    ),
  };
}
