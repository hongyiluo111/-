const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcrypt');

// 数据库连接字符串
const databaseUrl = "mysql://root:123456@localhost:3306/game";

// 创建MariaDB适配器
const adapter = new PrismaMariaDb(databaseUrl);

// 创建PrismaClient实例
const prisma = new PrismaClient({
  adapter,
});

async function createTestUser() {
  try {
    // 检查是否已有测试用户
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('测试用户已存在');
    } else {
      // 加密密码
      const hashedPassword = await bcrypt.hash('123456', 10);

      // 创建测试用户
      const user = await prisma.user.create({
        data: {
          name: '测试用户',
          email: 'test@example.com',
          password: hashedPassword,
          role: 'user',
          status: 'active'
        }
      });

      console.log('测试用户创建成功:', user);
    }
  } catch (error) {
    console.error('创建测试用户失败:', error);
  }
}

async function createAdminUser() {
  try {
    // 检查是否已有管理员用户
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      console.log('管理员用户已存在');
    } else {
      // 加密密码
      const hashedPassword = await bcrypt.hash('123456', 10);

      // 创建管理员用户
      const admin = await prisma.user.create({
        data: {
          name: '管理员',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          status: 'active'
        }
      });

      console.log('管理员用户创建成功:', admin);
    }
  } catch (error) {
    console.error('创建管理员用户失败:', error);
  }
}

async function main() {
  await createTestUser();
  await createAdminUser();
  await prisma.$disconnect();
}

main();