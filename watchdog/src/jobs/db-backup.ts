import { execFileSync } from 'node:child_process';
import { config } from '../config.js';
import { uploadBackup } from '../services/e2-storage.js';
import { createJobLog } from '../services/platform-db.js';
import { info, error as logError } from '../lib/logger.js';

function sanitizePgDumpUrl(connectionString: string): string {
	const url = new URL(connectionString);
	url.searchParams.delete('schema');
	return url.toString();
}

export async function runDbBackup(): Promise<void> {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
	try {
		const platformDump = execFileSync(
			'pg_dump',
			['--dbname', sanitizePgDumpUrl(config.DATABASE_URL), '--no-owner', '--no-acl'],
			{
				maxBuffer: 100 * 1024 * 1024
			}
		);
		const { size: platformSize } = await uploadBackup(
			'db-backups',
			Buffer.from(platformDump),
			`platform-${timestamp}`
		);

		const n8nDump = execFileSync(
			'pg_dump',
			['--dbname', sanitizePgDumpUrl(config.N8N_DB_URL), '--no-owner', '--no-acl'],
			{
				maxBuffer: 100 * 1024 * 1024
			}
		);
		const { size: n8nSize } = await uploadBackup(
			'db-backups',
			Buffer.from(n8nDump),
			`n8n-${timestamp}`
		);

		info('db-backup', 'Complete', { platformSize, n8nSize });
		await createJobLog('db_backup', null, 'success', { platformSize, n8nSize });
	} catch (err) {
		const msg = err instanceof Error ? err.message : 'Unknown';
		logError('db-backup', 'Failed', { error: msg });
		await createJobLog('db_backup', null, 'failed', { error: msg }).catch(() => {});
	}
}
