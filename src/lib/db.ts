import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured');
}

// Prisma 7.x 不再支持 schema 中的 url，必须通过 driver adapter 连接
// PrismaMariaDb 是工厂类，传入连接字符串，内部用 mariadb 包创建连接池
const adapter = new PrismaMariaDb(databaseUrl);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
