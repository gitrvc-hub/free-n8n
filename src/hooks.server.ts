import { handle as authHandle } from '$lib/server/auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const rateLimit: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/auth/signup') && event.request.method === 'POST') {
    const ip = event.getClientAddress();
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (entry && entry.resetAt > now) {
      if (entry.count >= 5) {
        return new Response(
          JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      entry.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 });
    }
  }
  return resolve(event);
};

export const handle = sequence(rateLimit, authHandle);
