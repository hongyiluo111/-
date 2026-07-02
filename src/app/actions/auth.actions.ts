'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { generateToken, setAuthCookie, getAuthCookie, verifyToken, clearAuthCookie } from '@/lib/jwt';

export async function registerUser(name: string, email: string, password: string, rememberMe: boolean = false) {
  try {
    // 密码强度校验（与 profile/password 路由一致）
    if (!password || password.length < 6) {
      throw new Error('密码长度至少 6 位');
    }
    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('邮箱格式不正确');
    }

    // 检查邮箱是否已被"未软删除"的用户占用
    // 注：email 是全局 unique，被软删除的邮箱需通过应用层处理（恢复或改邮箱）
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });

    if (existingUser && !existingUser.deletedAt) {
      throw new Error('该邮箱已被注册');
    }
    if (existingUser && existingUser.deletedAt) {
      throw new Error('该邮箱曾注册但已注销，请联系管理员恢复或使用其他邮箱');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
        status: 'active'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    // 生成token并设置cookie
    const token = generateToken(user.id, user.email, user.role, rememberMe);
    await setAuthCookie(token, rememberMe);

    revalidatePath('/login');
    revalidatePath('/register');
    return { success: true, user };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '注册失败' };
  }
}

export async function loginUser(email: string, password: string, rememberMe: boolean = false) {
  try {
    // 查找用户（用 findFirst 以支持 deletedAt 过滤，因为 email 是全局 unique 但我们想排除软删用户）
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
      }
    });

    // 统一文案防止邮箱枚举（不区分"用户不存在"和"密码错误"）
    if (!user) {
      throw new Error('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new Error('账号已被封禁，请联系管理员');
    }

    // 生成token并设置cookie
    const token = generateToken(user.id, user.email, user.role, rememberMe);
    await setAuthCookie(token, rememberMe);

    const { password: passwordHash, ...userWithoutPassword } = user;
    void passwordHash;

    revalidatePath('/');
    return { success: true, user: userWithoutPassword };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '登录失败' };
  }
}

export async function logoutUser() {
  try {
    await clearAuthCookie();
    revalidatePath('/');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '登出失败' };
  }
}

export async function getCurrentUser() {
  try {
    // 从cookie获取token
    const token = await getAuthCookie();
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      await clearAuthCookie();
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      }
    });

    // 过滤软删除用户和封禁用户
    if (!user || user.deletedAt || user.status !== 'active') {
      await clearAuthCookie();
      return null;
    }

    return user;
  } catch (error: unknown) {
    console.error('获取当前用户失败:', error);
    await clearAuthCookie();
    return null;
  }
}
