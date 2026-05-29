import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not configured');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseUrl),
});

async function main() {
  const email = 'xxesports@example.com';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`未找到邮箱为 ${email} 的用户`);
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('找到用户:', { id: user.id, name: user.name, email: user.email, role: user.role });

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'club_admin' },
  });

  console.log('更新成功:', { id: updated.id, name: updated.name, email: updated.email, role: updated.role });

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('错误:', error);
  await prisma.$disconnect();
  process.exit(1);
});
