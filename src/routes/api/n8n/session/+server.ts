import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user) redirect(303, '/auth/login');
  const user = await db.user.findUnique({ where: { id: session.user.id, deletedAt: null } });
  if (!user || user.status !== 'active') redirect(303, '/dashboard');
  redirect(303, '/n8n/');
};
