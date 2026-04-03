import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { FREE_PLAN_LIMITS } from '$lib/server/limits';
import { getUserUsageMetrics } from '$lib/server/n8n-metrics';
import { buildUsageCards } from '$lib/server/usage';

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) {
		return json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
	}

	const user = await db.user.findUnique({
		where: { id: session.user.id, deletedAt: null },
		select: { id: true, n8nUserId: true, status: true }
	});

	if (!user) {
		return json({ error: { code: 'NOT_FOUND', message: 'Sandbox not found' } }, { status: 404 });
	}

	const usage = await getUserUsageMetrics(user.n8nUserId);

	return json({
		status: user.status,
		plan: FREE_PLAN_LIMITS,
		usage: {
			activeWorkflowCount: usage.activeWorkflowCount,
			executionsToday: usage.executionsToday,
			lastExecutionAt: usage.lastExecutionAt?.toISOString() ?? null,
			cards: buildUsageCards(usage)
		}
	});
};
