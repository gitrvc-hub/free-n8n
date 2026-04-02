import { Resend } from 'resend';
import { env } from '$lib/server/env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${env.PUBLIC_APP_URL}/auth/verify?token=${token}`;
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify your free n8n account',
    html: `
      <h2>Welcome to Free n8n</h2>
      <p>Click the link below to verify your email and activate your n8n workspace:</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't sign up, you can safely ignore this email.</p>
    `
  });
  if (error) {
    console.error('[email] Failed to send verification email', { to, error: error.message });
    throw new Error('Failed to send verification email');
  }
}

export async function sendReclaimNotification(to: string): Promise<void> {
  const dashboardUrl = `${env.PUBLIC_APP_URL}/dashboard`;
  const { error } = await resend.emails.send({
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
