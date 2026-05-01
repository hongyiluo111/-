'use server';

import { prisma } from '@/lib/db';

export async function getUsers(page: number = 1, limit: number = 10) {
  try {
    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, users };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '获取用户列表失败' };
  }
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: isBanned ? 'banned' : 'active' }
    });
    return { success: true, user };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '更新用户状态失败' };
  }
}
