import { Resend } from 'resend';
import { env } from '$lib/server/env';
import { FREE_PLAN_LIMITS } from '$lib/server/limits';

let _resend: Resend;
function getResend() {
	if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
	return _resend;
}

export async function sendVerificationEmail(
	to: string,
	token: string,
	platformPassword: string
): Promise<void> {
	const verifyUrl = `${env.PUBLIC_APP_URL}/auth/verify?token=${token}`;
	const { error } = await getResend().emails.send({
		from: env.EMAIL_FROM,
		to,
		subject: 'Activate your Free n8n practice sandbox',
		html: `
			<div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0b1120; color: #e2e8f0; border-radius: 24px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.14);">
				<div style="padding: 32px 32px 24px; background: radial-gradient(circle at top left, rgba(56,189,248,0.22), transparent 28%), radial-gradient(circle at top right, rgba(99,102,241,0.22), transparent 32%), #0b1120;">
					<p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: #93c5fd;">Free n8n</p>
					<h1 style="margin: 16px 0 0; font-size: 30px; line-height: 1.1; color: white;">Verify your email and launch your practice sandbox.</h1>
					<p style="margin: 16px 0 0; font-size: 15px; line-height: 1.8; color: #cbd5e1;">Your shared n8n sandbox is reserved. Confirm your email address to activate it and use the credentials below to access the dashboard.</p>
				</div>
				<div style="padding: 0 32px 32px;">
					<p style="text-align: center; margin: 0 0 28px;">
						<a href="${verifyUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700;">Verify and activate</a>
					</p>
					<div style="background: rgba(15,23,42,0.88); border: 1px solid rgba(148,163,184,0.12); border-radius: 20px; padding: 20px;">
						<p style="margin: 0 0 14px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; color: #94a3b8;">Dashboard credentials</p>
						<table style="width: 100%; font-size: 14px; color: #e2e8f0; border-collapse: collapse;">
							<tr>
								<td style="padding: 6px 0; color: #94a3b8;">Email</td>
								<td style="padding: 6px 0; text-align: right;">${to}</td>
							</tr>
							<tr>
								<td style="padding: 6px 0; color: #94a3b8;">Password</td>
								<td style="padding: 6px 0; text-align: right;"><code style="background: rgba(99,102,241,0.16); color: #e0e7ff; padding: 4px 8px; border-radius: 10px;">${platformPassword}</code></td>
							</tr>
						</table>
						<p style="margin: 14px 0 0; font-size: 13px; line-height: 1.7; color: #94a3b8;">After login, use the dashboard to open n8n directly with SSO and start practicing. No second password is required inside the editor.</p>
					</div>
					<div style="margin-top: 20px; font-size: 13px; line-height: 1.8; color: #94a3b8;">
						<p style="margin: 0;">Free tier guardrails: ${FREE_PLAN_LIMITS.workflowLimit} active workflows, ${FREE_PLAN_LIMITS.executionLimitPerDay} executions per day, and archive after ${FREE_PLAN_LIMITS.reclaimDays} days of inactivity.</p>
						<p style="margin: 12px 0 0;">This verification link expires in 24 hours. If you did not request a sandbox, you can ignore this email.</p>
					</div>
				</div>
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
		subject: 'Your Free n8n sandbox was archived',
		html: `
			<div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0b1120; color: #e2e8f0; border-radius: 24px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.14);">
				<div style="padding: 32px 32px 24px; background: radial-gradient(circle at top left, rgba(251,191,36,0.18), transparent 28%), radial-gradient(circle at top right, rgba(99,102,241,0.16), transparent 32%), #0b1120;">
					<p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: #fde68a;">Sandbox archived</p>
					<h1 style="margin: 16px 0 0; font-size: 30px; line-height: 1.1; color: white;">Your workflows were backed up before reclaim.</h1>
					<p style="margin: 16px 0 0; font-size: 15px; line-height: 1.8; color: #cbd5e1;">We archived your sandbox after ${FREE_PLAN_LIMITS.reclaimDays} days of inactivity to keep the shared practice environment available. Your data is backed up and can be restored from the dashboard.</p>
				</div>
				<div style="padding: 0 32px 32px;">
					<p style="text-align: center; margin: 0 0 24px;">
						<a href="${dashboardUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700;">Restore my sandbox</a>
					</p>
					<p style="margin: 0; font-size: 13px; line-height: 1.8; color: #94a3b8;">Once restored, you can keep working with the same account and jump back into n8n from the dashboard.</p>
				</div>
			</div>
		`
	});
	if (error) {
		console.error('[email] Failed to send reclaim notification', { to, error: error.message });
	}
}
