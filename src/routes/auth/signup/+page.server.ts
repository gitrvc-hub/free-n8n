import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { db } from '$lib/server/db';
import { sendVerificationEmail } from '$lib/server/email';

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
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

    const { email, password } = parsed.data;
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return fail(400, {
        errors: { email: ['An account with this email already exists'] },
        email
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.create({ data: { email, passwordHash, verificationToken, verificationExpires } });
    await sendVerificationEmail(email, verificationToken);

    redirect(303, '/auth/verify?sent=true');
  }
};
