import { Resend } from 'resend';
import { config } from '../config.js';

let _resend: Resend;

function getResend() {
	if (!_resend) {
		_resend = new Resend(config.RESEND_API_KEY);
	}

	return _resend;
}

export async function sendReclaimNotification(to: string, reclaimDays: number): Promise<void> {
	const dashboardUrl = `${config.PUBLIC_APP_URL}/dashboard`;
	const { error } = await getResend().emails.send({
		from: config.EMAIL_FROM,
		to,
		subject: 'Your Free n8n sandbox was archived',
		html: `
			<div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0b1120; color: #e2e8f0; border-radius: 24px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.14);">
				<div style="padding: 32px 32px 24px; background: radial-gradient(circle at top left, rgba(251,191,36,0.18), transparent 28%), radial-gradient(circle at top right, rgba(99,102,241,0.16), transparent 32%), #0b1120;">
					<p style="margin: 0; font-size: 12px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; color: #fde68a;">Sandbox archived</p>
					<h1 style="margin: 16px 0 0; font-size: 30px; line-height: 1.1; color: white;">Your workflows were backed up before reclaim.</h1>
					<p style="margin: 16px 0 0; font-size: 15px; line-height: 1.8; color: #cbd5e1;">We archived your sandbox after ${reclaimDays} days of inactivity to keep the shared practice environment available. Your data is backed up and can be restored from the dashboard.</p>
				</div>
				<div style="padding: 0 32px 32px;">
					<p style="text-align: center; margin: 0 0 24px;">
						<a href="${dashboardUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700;">Restore my sandbox</a>
					</p>
					<p style="margin: 0; font-size: 13px; line-height: 1.8; color: #94a3b8;">Sign in with the same account you used before and restore when you are ready to continue building.</p>
				</div>
			</div>
		`
	});

	if (error) {
		throw new Error(error.message);
	}
}
