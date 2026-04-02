import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeUsers, reclaimedUsers, suspendedUsers, inactiveUsers, recentJobs, totalBackups] =
    await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.user.count({ where: { status: 'active', deletedAt: null, lastActiveAt: { gte: sevenDaysAgo } } }),
      db.user.count({ where: { status: 'reclaimed', deletedAt: null } }),
      db.user.count({ where: { status: 'suspended', deletedAt: null } }),
      db.user.count({ where: { status: 'active', deletedAt: null, lastActiveAt: { lt: sevenDaysAgo } } }),
      db.jobLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { user: { select: { email: true } } } }),
      db.backup.aggregate({ _sum: { sizeBytes: true }, _count: true })
    ]);

  return {
    stats: { totalUsers, activeUsers, inactiveUsers, reclaimedUsers, suspendedUsers, totalBackups: totalBackups._count, backupStorageBytes: Number(totalBackups._sum.sizeBytes ?? 0) },
    recentJobs: recentJobs.map((j) => ({ id: j.id, jobType: j.jobType, status: j.status, userEmail: j.user?.email ?? null, createdAt: j.createdAt.toISOString() }))
  };
};
