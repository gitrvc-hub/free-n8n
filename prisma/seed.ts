import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('Skipping seed: ADMIN_EMAIL and ADMIN_PASSWORD not set');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin user ${adminEmail} already exists`);
    return;
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      isVerified: true,
      isAdmin: true,
      status: 'active'
    }
  });
  console.log(`Admin user ${adminEmail} created`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
