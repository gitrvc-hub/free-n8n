import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  N8N_DB_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  N8N_API_URL: z.string().url(),
  N8N_API_KEY: z.string().min(1),
  N8N_ENCRYPTION_KEY: z.string().min(32),
  RESEND_API_KEY: z.string().startsWith('re_'),
  EMAIL_FROM: z.string().email(),
  E2_ENDPOINT: z.string().url(),
  E2_ACCESS_KEY_ID: z.string().min(1),
  E2_SECRET_ACCESS_KEY: z.string().min(1),
  E2_BUCKET: z.string().min(1),
  E2_REGION: z.string().min(1),
  REDIS_URL: z.string(),
  PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

function validateEnv(): Env {
  if (_env) return _env;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join('.')).join(', ');
    throw new Error(`[env] Missing or invalid environment variables: ${missing}`);
  }
  _env = result.data;
  return _env;
}

export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return validateEnv()[prop as keyof Env];
  }
});
