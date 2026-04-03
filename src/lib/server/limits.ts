import { FREE_PLAN_LIMITS } from '$lib/plan';

export { FREE_PLAN_LIMITS };

export function getRemainingLimit(limit: number, used: number): number {
	return Math.max(limit - used, 0);
}

export function getUsagePercent(limit: number, used: number): number {
	if (limit <= 0) return 0;
	return Math.min(Math.round((used / limit) * 100), 100);
}

export function getReclaimThresholdDate(reference = new Date()): Date {
	return new Date(reference.getTime() - FREE_PLAN_LIMITS.reclaimDays * 24 * 60 * 60 * 1000);
}
