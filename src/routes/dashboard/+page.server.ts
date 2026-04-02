import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user) redirect(303, '/auth/login');

  const user = await db.user.findUnique({
    where: { id: session.user.id, deletedAt: null },
    include: { backups: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });
  if (!user) redirect(303, '/auth/login');

  return {
    user: {
      email: user.email,
      status: user.status,
      lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
      hasBackup: user.backups.length > 0,
      createdAt: user.createdAt.toISOString()
    }
  };
};
