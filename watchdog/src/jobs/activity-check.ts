import { getAllUserActivity } from '../services/n8n-db.js';
import { updateUserActivity, createJobLog } from '../services/platform-db.js';
import { info, error as logError } from '../lib/logger.js';

export async function runActivityCheck(): Promise<void> {
	try {
		const activities = await getAllUserActivity();
		let updated = 0;
		for (const { n8nUserId, lastExecution } of activities) {
			if (lastExecution) {
				await updateUserActivity(n8nUserId, lastExecution);
				updated++;
			}
		}
		info('activity-check', 'Complete', { checked: activities.length, updated });
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Unknown';
		logError('activity-check', 'Failed', { error: msg });
		await createJobLog('activity_check', null, 'failed', { error: msg }).catch(() => {});
	}
}
