import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { FREE_PLAN_LIMITS, getReclaimThresholdDate } from '$lib/server/limits';
import { getUsersUsageMetrics } from '$lib/server/n8n-metrics';
import { getSandboxHealth } from '$lib/server/usage';

async function requireAdmin(event: { locals: App.Locals; request: Request }) {
	const session = await event.locals.auth();
	if (!session?.user) {
		return null;
	}

	const user = await db.user.findUnique({ where: { id: session.user.id, deletedAt: null } });
	if (!user?.isAdmin) {
		return null;
	}

	return user;
}

export const load: PageServerLoad = async (event) => {
	const admin = await requireAdmin(event);
	if (!admin) redirect(303, '/auth/login');

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
		db.user.count({ where: { deletedAt: null, isAdmin: false } }),
		db.user.count({
			where: {
				status: 'active',
				deletedAt: null,
				isAdmin: false,
				lastActiveAt: { gte: reclaimThreshold }
			}
		}),
		db.user.count({ where: { status: 'reclaimed', deletedAt: null, isAdmin: false } }),
		db.user.count({ where: { status: 'suspended', deletedAt: null, isAdmin: false } }),
		db.user.count({
			where: {
				status: 'active',
				deletedAt: null,
				isAdmin: false,
				lastActiveAt: { lt: reclaimThreshold }
			}
		}),
		db.jobLog.findMany({
			orderBy: { createdAt: 'desc' },
			take: 50,
			include: { user: { select: { email: true } } }
		}),
		db.backup.aggregate({ _sum: { sizeBytes: true }, _count: true }),
		db.user.findMany({
			where: { deletedAt: null, isAdmin: false },
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
		admin: {
			id: admin.id,
			email: admin.email
		},
		recentJobs: recentJobs.map((j) => ({
			id: j.id,
			jobType: j.jobType,
			status: j.status,
			userEmail: j.user?.email ?? null,
			createdAt: j.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	suspend: async (event) => {
		const admin = await requireAdmin(event);
		if (!admin) {
			return fail(403, { message: 'Forbidden' });
		}

		const formData = await event.request.formData();
		const userId = String(formData.get('userId') ?? '');

		const target = await db.user.findUnique({ where: { id: userId, deletedAt: null } });
		if (!target || target.isAdmin) {
			return fail(404, { message: 'User not found' });
		}

		await db.user.update({
			where: { id: target.id },
			data: { status: 'suspended' }
		});

		await db.jobLog.create({
			data: {
				jobType: 'health_check',
				status: 'success',
				userId: target.id,
				metadata: { action: 'suspend', adminUserId: admin.id }
			}
		});

		return { success: true, action: 'suspend', userId: target.id };
	},
	unsuspend: async (event) => {
		const admin = await requireAdmin(event);
		if (!admin) {
			return fail(403, { message: 'Forbidden' });
		}

		const formData = await event.request.formData();
		const userId = String(formData.get('userId') ?? '');

		const target = await db.user.findUnique({ where: { id: userId, deletedAt: null } });
		if (!target || target.isAdmin) {
			return fail(404, { message: 'User not found' });
		}

		await db.user.update({
			where: { id: target.id },
			data: {
				status: 'active',
				lastActiveAt: target.lastActiveAt ?? new Date()
			}
		});

		await db.jobLog.create({
			data: {
				jobType: 'health_check',
				status: 'success',
				userId: target.id,
				metadata: { action: 'unsuspend', adminUserId: admin.id }
			}
		});

		return { success: true, action: 'unsuspend', userId: target.id };
	}
};
