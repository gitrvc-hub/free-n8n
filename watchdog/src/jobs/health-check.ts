import { config } from '../config.js';
import { error as logError, warn } from '../lib/logger.js';
import { createJobLog } from '../services/platform-db.js';

export async function runHealthCheck(): Promise<void> {
	try {
		const response = await fetch(`${config.N8N_API_URL}/healthz`, {
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) {
			warn('health-check', `n8n returned ${response.status}`);
			await createJobLog('health_check', null, 'failed', { status: response.status });
		}
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Unknown';
		logError('health-check', 'n8n unreachable', { error: msg });
		await createJobLog('health_check', null, 'failed', { error: msg }).catch(() => {});
	}
}
