import cron from 'node-cron';
import { config } from './config.js';
import { info } from './lib/logger.js';
import { runActivityCheck } from './jobs/activity-check.js';
import { runInactivityReclaim } from './jobs/inactivity-reclaim.js';
import { runHealthCheck } from './jobs/health-check.js';
import { runDbBackup } from './jobs/db-backup.js';

info('watchdog', 'Starting', { inactivityDays: config.INACTIVITY_DAYS });

cron.schedule('0 * * * *', () => {
	runActivityCheck();
});
cron.schedule('5 * * * *', () => {
	runInactivityReclaim();
});
cron.schedule('*/5 * * * *', () => {
	runHealthCheck();
});
cron.schedule('0 3 * * *', () => {
	runDbBackup();
});

info('watchdog', 'All cron jobs scheduled');
