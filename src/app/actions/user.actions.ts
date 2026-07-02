'use server';

import { prisma } from '@/lib/db';
import { getAuthCookie, verifyToken } from '@/lib/jwt';

// 仅管理员可调用此模块的函数
async function requireAdmin(): Promise<string | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== 'admin') return null;
  return decoded.userId;
}

export async function getUsers(page: number = 1, limit: number = 10) {
  try {
    // 鉴权：仅管理员
    if (!(await requireAdmin())) {
      return { success: false, error: '无权访问' };
    }

    // 参数边界校验
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    // 过滤软删除用户
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          diamonds: true,
        },
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);
    return { success: true, users, total, page: safePage, limit: safeLimit };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '获取用户列表失败' };
  }
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
  try {
    // 鉴权：仅管理员
    const adminId = await requireAdmin();
    if (!adminId) {
      return { success: false, error: '无权访问' };
    }

    // 不允许封禁自己
    if (adminId === userId) {
      return { success: false, error: '不能封禁自己' };
    }

    // 校验目标用户存在且未软删除
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, deletedAt: true },
    });
    if (!target || target.deletedAt) {
      return { success: false, error: '用户不存在' };
    }

    // 不允许封禁超级管理员
    if (target.role === 'admin') {
      return { success: false, error: '不能封禁管理员' };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: isBanned ? 'banned' : 'active' }
    });
    return { success: true, user };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '更新用户状态失败' };
  }
}
