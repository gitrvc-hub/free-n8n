import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { FREE_PLAN_LIMITS, getReclaimThresholdDate } from '$lib/server/limits';
import { getUsersUsageMetrics } from '$lib/server/n8n-metrics';
import { getSandboxHealth } from '$lib/server/usage';

export const load: PageServerLoad = async () => {
	const reclaimThreshold = getReclaimThresholdDate();

	const [
		totalUsers,
		activeUsers,
		reclaimedUsers,
		suspendedUsers,
		inactiveUsers,
		recentJobs,
		totalBackups,
		allUsers
	] = await Promise.all([
		db.user.count({ where: { deletedAt: null } }),
		db.user.count({
			where: { status: 'active', deletedAt: null, lastActiveAt: { gte: reclaimThreshold } }
		}),
		db.user.count({ where: { status: 'reclaimed', deletedAt: null } }),
		db.user.count({ where: { status: 'suspended', deletedAt: null } }),
		db.user.count({
			where: { status: 'active', deletedAt: null, lastActiveAt: { lt: reclaimThreshold } }
		}),
		db.jobLog.findMany({
			orderBy: { createdAt: 'desc' },
			take: 50,
			include: { user: { select: { email: true } } }
		}),
		db.backup.aggregate({ _sum: { sizeBytes: true }, _count: true }),
		db.user.findMany({
			where: { deletedAt: null },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				email: true,
				status: true,
				isAdmin: true,
				isVerified: true,
				n8nUserId: true,
				lastActiveAt: true,
				createdAt: true,
				_count: { select: { backups: true } }
			}
		})
	]);

	const usageByUserId = await getUsersUsageMetrics(
		allUsers.flatMap((user) => (user.n8nUserId ? [user.n8nUserId] : []))
	);

	const overWorkflowLimit = allUsers.filter((user) => {
		const usage = user.n8nUserId ? usageByUserId.get(user.n8nUserId) : null;
		return (usage?.activeWorkflowCount ?? 0) >= FREE_PLAN_LIMITS.workflowLimit;
	}).length;

	const overExecutionLimit = allUsers.filter((user) => {
		const usage = user.n8nUserId ? usageByUserId.get(user.n8nUserId) : null;
		return (usage?.executionsToday ?? 0) >= FREE_PLAN_LIMITS.executionLimitPerDay;
	}).length;

	const atRiskUsers = allUsers.filter(
		(user) =>
			user.status === 'active' && (!user.lastActiveAt || user.lastActiveAt < reclaimThreshold)
	).length;

	return {
		stats: {
			totalUsers,
			activeUsers,
			inactiveUsers,
			reclaimedUsers,
			suspendedUsers,
			totalBackups: totalBackups._count,
			backupStorageBytes: Number(totalBackups._sum.sizeBytes ?? 0),
			overWorkflowLimit,
			overExecutionLimit,
			atRiskUsers,
			reclaimDays: FREE_PLAN_LIMITS.reclaimDays
		},
		users: allUsers.map((u) => ({
			id: u.id,
			email: u.email,
			status: u.status,
			isAdmin: u.isAdmin,
			isVerified: u.isVerified,
			lastActiveAt: u.lastActiveAt?.toISOString() ?? null,
			createdAt: u.createdAt.toISOString(),
			backupCount: u._count.backups,
			usage: u.n8nUserId
				? (usageByUserId.get(u.n8nUserId) ?? {
						activeWorkflowCount: 0,
						executionsToday: 0,
						lastExecutionAt: null
					})
				: {
						activeWorkflowCount: 0,
						executionsToday: 0,
						lastExecutionAt: null
					},
			sandboxHealth: getSandboxHealth(
				u.n8nUserId
					? (usageByUserId.get(u.n8nUserId) ?? {
							activeWorkflowCount: 0,
							executionsToday: 0,
							lastExecutionAt: null
						})
					: {
							activeWorkflowCount: 0,
							executionsToday: 0,
							lastExecutionAt: null
						},
				u.status
			)
		})),
		recentJobs: recentJobs.map((j) => ({
			id: j.id,
			jobType: j.jobType,
			status: j.status,
			userEmail: j.user?.email ?? null,
			createdAt: j.createdAt.toISOString()
		}))
	};
};
