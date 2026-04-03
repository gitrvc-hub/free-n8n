import pg from 'pg';
import { config } from '../config.js';

const pool = new pg.Pool({ connectionString: config.N8N_DB_URL, max: 3 });

export async function getAllUserActivity(): Promise<
	Array<{ n8nUserId: string; lastExecution: Date | null }>
> {
	const result = await pool.query(
		`SELECT sw."userId" as "n8nUserId", MAX(ee."startedAt") as "lastExecution"
     FROM shared_workflow sw
     LEFT JOIN workflow_entity we ON sw."workflowId" = we.id
     LEFT JOIN execution_entity ee ON we.id = ee."workflowId"
     GROUP BY sw."userId"`
	);
	return result.rows;
}

export async function getUserWorkflows(n8nUserId: string): Promise<
	Array<{
		id: string;
		name: string;
		nodes: unknown;
		connections: unknown;
		settings: unknown;
		active: boolean;
	}>
> {
	const result = await pool.query(
		`SELECT we.id, we.name, we.nodes, we.connections, we.settings, we.active
     FROM workflow_entity we JOIN shared_workflow sw ON we.id = sw."workflowId"
     WHERE sw."userId" = $1`,
		[n8nUserId]
	);
	return result.rows;
}

export async function deactivateUser(n8nUserId: string): Promise<void> {
	await pool.query(
		`UPDATE workflow_entity SET active = false WHERE id IN (SELECT "workflowId" FROM shared_workflow WHERE "userId" = $1)`,
		[n8nUserId]
	);
}

export async function deleteUserData(n8nUserId: string): Promise<void> {
	await pool.query(
		`DELETE FROM execution_entity WHERE id IN (SELECT ee.id FROM execution_entity ee JOIN workflow_entity we ON ee."workflowId" = we.id JOIN shared_workflow sw ON we.id = sw."workflowId" WHERE sw."userId" = $1)`,
		[n8nUserId]
	);
	await pool.query(
		`DELETE FROM workflow_entity WHERE id IN (SELECT "workflowId" FROM shared_workflow WHERE "userId" = $1)`,
		[n8nUserId]
	);
	await pool.query(`DELETE FROM shared_workflow WHERE "userId" = $1`, [n8nUserId]);
	await pool.query(`DELETE FROM shared_credentials WHERE "userId" = $1`, [n8nUserId]);
}
