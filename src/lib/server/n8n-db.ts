import pg from 'pg';
import bcrypt from 'bcryptjs';
import { env } from '$lib/server/env';

let _pool: pg.Pool;
function getPool() {
	if (!_pool) _pool = new pg.Pool({ connectionString: env.N8N_DB_URL, max: 5 });
	return _pool;
}

export interface N8nUser {
	id: string;
	email: string;
	roleSlug: string;
}

export async function createN8nUser(email: string, password: string): Promise<N8nUser> {
	const hashedPassword = await bcrypt.hash(password, 10);
	const now = new Date().toISOString();
	const pool = getPool();

	// Create the user
	const result = await pool.query(
		`INSERT INTO "user" (email, "firstName", "lastName", password, "roleSlug", "personalizationAnswers", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, email, "roleSlug"`,
		[email, 'Free', 'User', hashedPassword, 'global:member', null, now, now]
	);

	const user = result.rows[0] as N8nUser;

	// Create personal project (required by n8n for user to function)
	const projectResult = await pool.query(
		`INSERT INTO project (id, name, type, "creatorId")
     VALUES (gen_random_uuid(), $1, 'personal', $2)
     RETURNING id`,
		[email, user.id]
	);

	const projectId = projectResult.rows[0].id;

	// Link user to their personal project
	await pool.query(
		`INSERT INTO project_relation ("projectId", "userId", role)
     VALUES ($1, $2, 'project:personalOwner')`,
		[projectId, user.id]
	);

	return user;
}

export async function deactivateN8nUser(n8nUserId: string): Promise<void> {
	await getPool().query(
		`UPDATE workflow_entity SET active = false WHERE id IN (
       SELECT "workflowId" FROM shared_workflow WHERE "userId" = $1
     )`,
		[n8nUserId]
	);
}

export async function deleteN8nUserData(n8nUserId: string): Promise<void> {
	await getPool().query(
		`DELETE FROM execution_entity WHERE id IN (
       SELECT ee.id FROM execution_entity ee
       JOIN workflow_entity we ON ee."workflowId" = we.id
       JOIN shared_workflow sw ON we.id = sw."workflowId"
       WHERE sw."userId" = $1
     )`,
		[n8nUserId]
	);
	await getPool().query(
		`DELETE FROM workflow_entity WHERE id IN (
       SELECT "workflowId" FROM shared_workflow WHERE "userId" = $1
     )`,
		[n8nUserId]
	);
	await getPool().query(`DELETE FROM shared_workflow WHERE "userId" = $1`, [n8nUserId]);
	await getPool().query(`DELETE FROM shared_credentials WHERE "userId" = $1`, [n8nUserId]);
}

export async function getLastExecutionTime(n8nUserId: string): Promise<Date | null> {
	const result = await getPool().query(
		`SELECT MAX(ee."startedAt") as last_execution
     FROM execution_entity ee
     JOIN workflow_entity we ON ee."workflowId" = we.id
     JOIN shared_workflow sw ON we.id = sw."workflowId"
     WHERE sw."userId" = $1`,
		[n8nUserId]
	);
	return result.rows[0]?.last_execution ?? null;
}

export async function getAllUserActivity(): Promise<
	Array<{ n8nUserId: string; lastExecution: Date | null }>
> {
	const result = await getPool().query(
		`SELECT sw."userId" as "n8nUserId", MAX(ee."startedAt") as "lastExecution"
     FROM shared_workflow sw
     LEFT JOIN workflow_entity we ON sw."workflowId" = we.id
     LEFT JOIN execution_entity ee ON we.id = ee."workflowId"
     GROUP BY sw."userId"`
	);
	return result.rows;
}
