import { z } from 'zod';

const configSchema = z.object({
	DATABASE_URL: z.string(),
	N8N_DB_URL: z.string(),
	N8N_API_URL: z.string(),
	N8N_API_KEY: z.string().min(1),
	RESEND_API_KEY: z.string().startsWith('re_'),
	EMAIL_FROM: z.string().email(),
	PUBLIC_APP_URL: z.string().url(),
	E2_ENDPOINT: z.string(),
	E2_ACCESS_KEY_ID: z.string().min(1),
	E2_SECRET_ACCESS_KEY: z.string().min(1),
	E2_BUCKET: z.string().min(1),
	E2_REGION: z.string().min(1),
	INACTIVITY_DAYS: z.coerce.number().default(7),
	MAX_RECLAIM_RETRIES: z.coerce.number().default(3)
});

export type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
	const result = configSchema.safeParse(process.env);
	if (!result.success) {
		const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
		throw new Error(`[watchdog] Missing config: ${missing}`);
	}
	return result.data;
}

export const config = loadConfig();
