import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { db } from '$lib/server/db';
import { encrypt } from '$lib/server/encryption';
import { env } from '$lib/server/env';
import { sendVerificationEmail } from '$lib/server/email';

const signupSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());
    const parsed = signupSchema.safeParse(formData);

    if (!parsed.success) {
      return fail(400, {
        errors: parsed.error.flatten().fieldErrors,
        email: formData.email as string
      });
    }

    const { email } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return fail(400, {
        errors: { email: ['An account with this email already exists'] },
        email
      });
    }

    // Auto-generate both passwords
    const platformPassword = randomBytes(12).toString('base64url');
    const n8nPassword = randomBytes(12).toString('base64url');
    const passwordHash = await bcrypt.hash(platformPassword, 12);
    const n8nPasswordEncrypted = encrypt(n8nPassword, env.N8N_ENCRYPTION_KEY);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.create({
      data: { email, passwordHash, verificationToken, verificationExpires, n8nPasswordEncrypted }
    });
    await sendVerificationEmail(email, verificationToken, platformPassword);

    redirect(303, '/auth/verify?sent=true');
  }
};
