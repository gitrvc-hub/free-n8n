import pg from 'pg';
import { env } from '$lib/server/env';

let _pool: pg.Pool;

function getPool() {
	if (!_pool) {
		_pool = new pg.Pool({ connectionString: env.N8N_DB_URL, max: 5 });
	}

	return _pool;
}

export interface N8nUsageMetrics {
	activeWorkflowCount: number;
	executionsToday: number;
	lastExecutionAt: Date | null;
}

const EMPTY_METRICS: N8nUsageMetrics = {
	activeWorkflowCount: 0,
	executionsToday: 0,
	lastExecutionAt: null
};

export async function getUserUsageMetrics(
	n8nUserId: string | null | undefined
): Promise<N8nUsageMetrics> {
	if (!n8nUserId) return EMPTY_METRICS;

	const result = await getPool().query(
		`SELECT
			COUNT(DISTINCT we.id) FILTER (WHERE COALESCE(we.active, false) = true) AS "activeWorkflowCount",
			COUNT(ee.id) FILTER (WHERE ee."startedAt" >= date_trunc('day', NOW())) AS "executionsToday",
			MAX(ee."startedAt") AS "lastExecutionAt"
		 FROM shared_workflow sw
		 LEFT JOIN workflow_entity we ON sw."workflowId" = we.id
		 LEFT JOIN execution_entity ee ON we.id = ee."workflowId"
		 WHERE sw."userId" = $1`,
		[n8nUserId]
	);

	const row = result.rows[0];

	return {
		activeWorkflowCount: Number(row?.activeWorkflowCount ?? 0),
		executionsToday: Number(row?.executionsToday ?? 0),
		lastExecutionAt: row?.lastExecutionAt ?? null
	};
}

export async function getUsersUsageMetrics(
	n8nUserIds: string[]
): Promise<Map<string, N8nUsageMetrics>> {
	const usageMap = new Map<string, N8nUsageMetrics>();

	for (const n8nUserId of n8nUserIds) {
		usageMap.set(n8nUserId, EMPTY_METRICS);
	}

	if (n8nUserIds.length === 0) return usageMap;

	const result = await getPool().query(
		`SELECT
			sw."userId" AS "n8nUserId",
			COUNT(DISTINCT we.id) FILTER (WHERE COALESCE(we.active, false) = true) AS "activeWorkflowCount",
			COUNT(ee.id) FILTER (WHERE ee."startedAt" >= date_trunc('day', NOW())) AS "executionsToday",
			MAX(ee."startedAt") AS "lastExecutionAt"
		 FROM shared_workflow sw
		 LEFT JOIN workflow_entity we ON sw."workflowId" = we.id
		 LEFT JOIN execution_entity ee ON we.id = ee."workflowId"
		 WHERE sw."userId" = ANY($1::uuid[])
		 GROUP BY sw."userId"`,
		[n8nUserIds]
	);

	for (const row of result.rows) {
		usageMap.set(row.n8nUserId as string, {
			activeWorkflowCount: Number(row.activeWorkflowCount ?? 0),
			executionsToday: Number(row.executionsToday ?? 0),
			lastExecutionAt: row.lastExecutionAt ?? null
		});
	}

	return usageMap;
}
