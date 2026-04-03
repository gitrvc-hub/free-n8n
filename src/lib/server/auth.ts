import { SvelteKitAuth } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';
import { db } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		Credentials({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				const parsed = loginSchema.safeParse(credentials);
				if (!parsed.success) return null;

				const user = await db.user.findUnique({
					where: { email: parsed.data.email, deletedAt: null }
				});

				if (!user || !user.isVerified || user.status === 'suspended') return null;

				const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
				if (!valid) return null;

				return {
					id: user.id,
					email: user.email,
					isAdmin: user.isAdmin,
					status: user.status,
					n8nUserId: user.n8nUserId
				};
			}
		})
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.isAdmin = (user as { isAdmin: boolean }).isAdmin;
				token.status = (user as { status: string }).status;
				token.n8nUserId = (user as { n8nUserId: string | null }).n8nUserId;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				const user = session.user as unknown as Record<string, unknown>;
				user.isAdmin = token.isAdmin;
				user.status = token.status;
				user.n8nUserId = token.n8nUserId;
			}
			return session;
		}
	},
	pages: { signIn: '/auth/login' },
	trustHost: true
});
