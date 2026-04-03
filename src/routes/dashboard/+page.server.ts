import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { FREE_PLAN_LIMITS } from '$lib/server/limits';
import { getUserUsageMetrics } from '$lib/server/n8n-metrics';
import { buildUsageCards, getSandboxHealth } from '$lib/server/usage';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user) redirect(303, '/auth/login');

	const user = await db.user.findUnique({
		where: { id: session.user.id, deletedAt: null },
		include: { backups: { orderBy: { createdAt: 'desc' }, take: 1 } }
	});
	if (!user) redirect(303, '/auth/login');

	const usage = await getUserUsageMetrics(user.n8nUserId);
	const latestBackup = user.backups[0] ?? null;

	return {
		user: {
			id: user.id,
			email: user.email,
			status: user.status,
			lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
			hasBackup: user.backups.length > 0,
			createdAt: user.createdAt.toISOString(),
			sandboxHealth: getSandboxHealth(usage, user.status)
		},
		plan: {
			workflowLimit: FREE_PLAN_LIMITS.workflowLimit,
			executionLimitPerDay: FREE_PLAN_LIMITS.executionLimitPerDay,
			reclaimDays: FREE_PLAN_LIMITS.reclaimDays
		},
		usage: {
			activeWorkflowCount: usage.activeWorkflowCount,
			executionsToday: usage.executionsToday,
			lastExecutionAt: usage.lastExecutionAt?.toISOString() ?? null,
			cards: buildUsageCards(usage)
		},
		backup: latestBackup
			? {
					id: latestBackup.id,
					createdAt: latestBackup.createdAt.toISOString(),
					sizeBytes: Number(latestBackup.sizeBytes)
				}
			: null,
		limitReached: event.url.searchParams.get('limit') === '1'
	};
};
