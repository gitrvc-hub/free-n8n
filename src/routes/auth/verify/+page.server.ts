import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { createN8nUser } from '$lib/server/n8n-db';
import { encrypt, decrypt } from '$lib/server/encryption';
import { env } from '$lib/server/env';
import { randomBytes } from 'node:crypto';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	const sent = url.searchParams.get('sent');

	if (sent) return { status: 'sent' as const };
	if (!token) return { status: 'invalid' as const };

	const user = await db.user.findFirst({
		where: { verificationToken: token, verificationExpires: { gt: new Date() }, isVerified: false }
	});

	if (!user) return { status: 'invalid' as const };

	// Decrypt the pre-generated n8n password
	const n8nPassword = user.n8nPasswordEncrypted
		? decrypt(user.n8nPasswordEncrypted, env.N8N_ENCRYPTION_KEY)
		: randomBytes(12).toString('base64url');

	const n8nUser = await createN8nUser(user.email, n8nPassword);
	const n8nPasswordEncrypted =
		user.n8nPasswordEncrypted ?? encrypt(n8nPassword, env.N8N_ENCRYPTION_KEY);

	await db.user.update({
		where: { id: user.id },
		data: {
			isVerified: true,
			verificationToken: null,
			verificationExpires: null,
			n8nUserId: n8nUser.id,
			n8nPasswordEncrypted,
			lastActiveAt: new Date()
		}
	});

	return { status: 'verified' as const };
};
