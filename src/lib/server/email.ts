import { Resend } from 'resend';
import { env } from '$lib/server/env';

let _resend: Resend;
function getResend() {
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export async function sendVerificationEmail(to: string, token: string, n8nPassword: string): Promise<void> {
  const verifyUrl = `${env.PUBLIC_APP_URL}/auth/verify?token=${token}`;
  const { error } = await getResend().emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your free n8n account',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1e1b4b;">Welcome to Free n8n</h2>
        <p>Click the button below to verify your email and activate your n8n workspace:</p>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify my email</a>
        </p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #334155;">Your n8n login credentials:</p>
          <p style="margin: 4px 0; color: #475569;"><strong>Email:</strong> ${to}</p>
          <p style="margin: 4px 0; color: #475569;"><strong>Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${n8nPassword}</code></p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">Use these to sign in to the n8n editor after verification.</p>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `
  });
  if (error) {
    console.error('[email] Failed to send verification email', { to, error: error.message });
    throw new Error('Failed to send verification email');
  }
}

export async function sendReclaimNotification(to: string): Promise<void> {
  const dashboardUrl = `${env.PUBLIC_APP_URL}/dashboard`;
  const { error } = await getResend().emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Your n8n workspace has been archived',
    html: `
      <h2>Workspace Archived</h2>
      <p>Your free n8n workspace was archived due to 7 days of inactivity.</p>
      <p>Your workflows and data have been backed up. You can restore them anytime from your dashboard:</p>
      <p><a href="${dashboardUrl}">Restore my workspace</a></p>
    `
  });
  if (error) {
    console.error('[email] Failed to send reclaim notification', { to, error: error.message });
  }
}
