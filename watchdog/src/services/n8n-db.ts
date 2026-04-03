import pg from 'pg';
import { config } from '../config.js';

const pool = new pg.Pool({ connectionString: config.N8N_DB_URL, max: 3 });

export async function getAllUserActivity(): Promise<
	Array<{ n8nUserId: string; lastExecution: Date | null }>
> {
	const result = await pool.query(
		`SELECT pr."userId" as "n8nUserId", MAX(ee."startedAt") as "lastExecution"
	     FROM project_relation pr
	     LEFT JOIN shared_workflow sw ON pr."projectId" = sw."projectId"
	     LEFT JOIN workflow_entity we ON sw."workflowId" = we.id
	     LEFT JOIN execution_entity ee ON we.id = ee."workflowId"
	     GROUP BY pr."userId"`
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
	     FROM project_relation pr
	     JOIN shared_workflow sw ON pr."projectId" = sw."projectId"
	     JOIN workflow_entity we ON we.id = sw."workflowId"
	     WHERE pr."userId" = $1`,
		[n8nUserId]
	);
	return result.rows;
}

export async function deactivateUser(n8nUserId: string): Promise<void> {
	await pool.query(
		`UPDATE workflow_entity SET active = false WHERE id IN (
			SELECT sw."workflowId"
			FROM shared_workflow sw
			JOIN project_relation pr ON pr."projectId" = sw."projectId"
			WHERE pr."userId" = $1
		)`,
		[n8nUserId]
	);
}

export async function deleteUserData(n8nUserId: string): Promise<void> {
	await pool.query(
		`DELETE FROM execution_entity WHERE id IN (
			SELECT ee.id
			FROM execution_entity ee
			JOIN workflow_entity we ON ee."workflowId" = we.id
			JOIN shared_workflow sw ON we.id = sw."workflowId"
			JOIN project_relation pr ON pr."projectId" = sw."projectId"
			WHERE pr."userId" = $1
		)`,
		[n8nUserId]
	);
	await pool.query(
		`DELETE FROM workflow_entity WHERE id IN (
			SELECT sw."workflowId"
			FROM shared_workflow sw
			JOIN project_relation pr ON pr."projectId" = sw."projectId"
			WHERE pr."userId" = $1
		)`,
		[n8nUserId]
	);
	await pool.query(
		`DELETE FROM shared_workflow
		 WHERE "projectId" IN (SELECT "projectId" FROM project_relation WHERE "userId" = $1)`,
		[n8nUserId]
	);
	await pool.query(
		`DELETE FROM shared_credentials
		 WHERE "projectId" IN (SELECT "projectId" FROM project_relation WHERE "userId" = $1)`,
		[n8nUserId]
	);
}
