import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { decrypt } from '$lib/server/encryption';
import { env } from '$lib/server/env';
import { FREE_PLAN_LIMITS } from '$lib/server/limits';
import { getUserUsageMetrics } from '$lib/server/n8n-metrics';

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) redirect(303, '/auth/login');

	const user = await db.user.findUnique({ where: { id: session.user.id, deletedAt: null } });
	if (user?.isAdmin) {
		redirect(303, '/admin');
	}
	if (!user || user.status !== 'active' || !user.n8nPasswordEncrypted) redirect(303, '/dashboard');

	const usage = await getUserUsageMetrics(user.n8nUserId);
	if (
		usage.activeWorkflowCount >= FREE_PLAN_LIMITS.workflowLimit ||
		usage.executionsToday >= FREE_PLAN_LIMITS.executionLimitPerDay
	) {
		redirect(303, '/dashboard?limit=1');
	}

	// Decrypt n8n password and login via n8n's REST API
	const n8nPassword = decrypt(user.n8nPasswordEncrypted!, env.N8N_ENCRYPTION_KEY);

	const loginRes = await fetch(`${env.N8N_API_URL}/rest/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ emailOrLdapLoginId: user.email, password: n8nPassword })
	});

	if (!loginRes.ok) {
		// Fallback: redirect to n8n login page
		redirect(303, '/n8n/');
	}

	// Extract n8n session cookies and set them on the user's browser
	const setCookies = loginRes.headers.getSetCookie();
	const headers = new Headers();
	headers.set('location', '/n8n/');

	for (const cookie of setCookies) {
		// Rewrite cookie path to work under /n8n/ and root
		const rewritten = cookie.replace(/path=\/[^;]*/i, 'path=/').replace(/domain=[^;]*/i, '');
		headers.append('set-cookie', rewritten);
	}

	return new Response(null, { status: 303, headers });
};
