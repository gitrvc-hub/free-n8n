import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { downloadBackup } from '$lib/server/e2-storage';
import { importWorkflow } from '$lib/server/n8n-api';
import { gunzipSync } from 'node:zlib';

export const POST: RequestHandler = async (event) => {
  const session = await event.locals.auth();
  if (!session?.user) {
    return json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id, deletedAt: null },
    include: { backups: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  if (!user || user.status !== 'reclaimed') {
    return json({ error: { code: 'BAD_REQUEST', message: 'Not in reclaimed state' } }, { status: 400 });
  }

  const backup = user.backups[0];
  if (!backup) {
    return json({ error: { code: 'NOT_FOUND', message: 'No backup found' } }, { status: 404 });
  }

  try {
    const compressed = await downloadBackup(backup.e2Path);
    const raw = gunzipSync(compressed);
    const data = JSON.parse(raw.toString()) as {
      workflows: Array<{ id: string; name: string; active: boolean; nodes: unknown[]; connections: unknown }>
    };

    for (const workflow of data.workflows) {
      await importWorkflow(workflow);
    }

    await db.user.update({
      where: { id: user.id },
      data: { status: 'active', lastActiveAt: new Date() }
    });

    await db.jobLog.create({
      data: { jobType: 'restore', userId: user.id, status: 'success', metadata: { backupId: backup.id, workflowCount: data.workflows.length } }
    });

    return json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[restore] Failed', { userId: user.id, error: message });
    await db.jobLog.create({
      data: { jobType: 'restore', userId: user.id, status: 'failed', metadata: { error: message } }
    });
    return json({ error: { code: 'RESTORE_FAILED', message: 'Failed to restore. Try again.' } }, { status: 500 });
  }
};
