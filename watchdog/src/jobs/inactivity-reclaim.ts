import { gzipSync } from 'node:zlib';
import { config } from '../config.js';
import { getUserWorkflows, deactivateUser, deleteUserData } from '../services/n8n-db.js';
import {
	getInactiveUsers,
	markUserReclaimed,
	createBackupRecord,
	createJobLog
} from '../services/platform-db.js';
import { uploadBackup } from '../services/e2-storage.js';
import { info, error as logError } from '../lib/logger.js';
import { sendReclaimNotification } from '../services/email.js';

export async function runInactivityReclaim(): Promise<void> {
	try {
		const users = await getInactiveUsers(config.INACTIVITY_DAYS);
		info('reclaim', `Found ${users.length} inactive users`);
		for (const user of users) {
			await reclaimUser(user);
		}
	} catch (err) {
		logError('reclaim', 'Job failed', { error: err instanceof Error ? err.message : 'Unknown' });
	}
}

async function reclaimUser(user: { id: string; email: string; n8nUserId: string }): Promise<void> {
	const timestamp = new Date().toISOString();
	try {
		const workflows = await getUserWorkflows(user.n8nUserId);
		const data = JSON.stringify({ workflows, exportedAt: timestamp, userId: user.id });
		const compressed = gzipSync(Buffer.from(data));
		const { key, size } = await uploadBackup(user.id, compressed, timestamp);
		await createBackupRecord(user.id, key, size);
		await deactivateUser(user.n8nUserId);
		await deleteUserData(user.n8nUserId);
		await markUserReclaimed(user.id);
		await sendReclaimNotification(user.email, config.INACTIVITY_DAYS);
		await createJobLog('reclaim', user.id, 'success', {
			backupKey: key,
			backupSize: size,
			workflowCount: workflows.length
		});
		info('reclaim', `Reclaimed ${user.email}`, { workflows: workflows.length, backupSize: size });
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Unknown';
		logError('reclaim', `Failed for ${user.email}`, { error: msg });
		await createJobLog('reclaim', user.id, 'failed', { error: msg }).catch(() => {});
	}
}
