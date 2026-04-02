import pg from 'pg';
import { config } from '../config.js';

const pool = new pg.Pool({ connectionString: config.DATABASE_URL, max: 3 });

export async function updateUserActivity(n8nUserId: string, lastActiveAt: Date): Promise<void> {
  await pool.query(`UPDATE users SET last_active_at = $1, updated_at = NOW() WHERE n8n_user_id = $2 AND deleted_at IS NULL`, [lastActiveAt, n8nUserId]);
}

export async function getInactiveUsers(days: number): Promise<Array<{ id: string; email: string; n8nUserId: string }>> {
  const result = await pool.query(
    `SELECT id, email, n8n_user_id as "n8nUserId" FROM users
     WHERE status = 'active' AND deleted_at IS NULL AND n8n_user_id IS NOT NULL
       AND (last_active_at IS NULL OR last_active_at < NOW() - INTERVAL '1 day' * $1)`,
    [days]
  );
  return result.rows;
}

export async function markUserReclaimed(userId: string): Promise<void> {
  await pool.query(`UPDATE users SET status = 'reclaimed', updated_at = NOW() WHERE id = $1`, [userId]);
}

export async function createBackupRecord(userId: string, e2Path: string, sizeBytes: number): Promise<void> {
  await pool.query(`INSERT INTO backups (id, user_id, e2_path, size_bytes, created_at) VALUES (gen_random_uuid(), $1, $2, $3, NOW())`, [userId, e2Path, sizeBytes]);
}

export async function createJobLog(jobType: string, userId: string | null, status: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await pool.query(`INSERT INTO job_logs (id, job_type, user_id, status, metadata, created_at) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`, [jobType, userId, status, JSON.stringify(metadata)]);
}
