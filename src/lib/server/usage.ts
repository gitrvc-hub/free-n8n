import { FREE_PLAN_LIMITS, getRemainingLimit, getUsagePercent } from '$lib/server/limits';
import type { N8nUsageMetrics } from '$lib/server/n8n-metrics';

export interface PlanUsageCard {
	label: string;
	used: number;
	limit: number;
	remaining: number;
	percent: number;
	helpText: string;
	status: 'healthy' | 'warning' | 'limit';
}

function getUsageStatus(percent: number): PlanUsageCard['status'] {
	if (percent >= 100) return 'limit';
	if (percent >= 80) return 'warning';
	return 'healthy';
}

export function buildUsageCards(metrics: N8nUsageMetrics): PlanUsageCard[] {
	const workflowPercent = getUsagePercent(
		FREE_PLAN_LIMITS.workflowLimit,
		metrics.activeWorkflowCount
	);
	const executionPercent = getUsagePercent(
		FREE_PLAN_LIMITS.executionLimitPerDay,
		metrics.executionsToday
	);

	return [
		{
			label: 'Active workflows',
			used: metrics.activeWorkflowCount,
			limit: FREE_PLAN_LIMITS.workflowLimit,
			remaining: getRemainingLimit(FREE_PLAN_LIMITS.workflowLimit, metrics.activeWorkflowCount),
			percent: workflowPercent,
			helpText: 'Keep your practice automations within the sandbox cap.',
			status: getUsageStatus(workflowPercent)
		},
		{
			label: 'Executions today',
			used: metrics.executionsToday,
			limit: FREE_PLAN_LIMITS.executionLimitPerDay,
			remaining: getRemainingLimit(FREE_PLAN_LIMITS.executionLimitPerDay, metrics.executionsToday),
			percent: executionPercent,
			helpText: 'Usage resets daily. Keep bigger experiments short and lightweight.',
			status: getUsageStatus(executionPercent)
		}
	];
}

export function getSandboxHealth(
	metrics: N8nUsageMetrics,
	status: 'active' | 'reclaimed' | 'suspended'
): 'active' | 'attention' | 'archived' | 'suspended' {
	if (status === 'suspended') return 'suspended';
	if (status === 'reclaimed') return 'archived';
	if (
		metrics.activeWorkflowCount >= FREE_PLAN_LIMITS.workflowLimit ||
		metrics.executionsToday >= FREE_PLAN_LIMITS.executionLimitPerDay
	) {
		return 'attention';
	}
	return 'active';
}
