import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user) redirect(303, '/auth/login');
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) redirect(303, '/dashboard');
};
