'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function createTestUser() {
  try {
    // 检查是否已有测试用户
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      return { success: true, message: '测试用户已存在' };
    }

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

    return { success: true, message: '测试用户创建成功', user };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '创建测试用户失败' };
  }
}

export async function createAdminUser() {
  try {
    // 检查是否已有管理员用户
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      return { success: true, message: '管理员用户已存在' };
    }

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

    return { success: true, message: '管理员用户创建成功', admin };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '创建管理员用户失败' };
  }
}

