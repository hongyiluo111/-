'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { generateToken, setAuthCookie, getAuthCookie, verifyToken, clearAuthCookie } from '@/lib/jwt';
import fs from 'fs';
import path from 'path';

export async function registerUser(name: string, email: string, password: string) {
  try {
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('该邮箱已被注册');
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
    const token = generateToken(user.id, user.email, user.role);
    await setAuthCookie(token);

    try {
      const usersFilePath = path.join(process.cwd(), 'users-list.txt');
      const now = new Date();
      const userCount = (await prisma.user.count());
      
      const userEntry = `
用户 ${userCount}:
  邮箱: ${user.email}
  姓名: ${user.name}
  角色: 普通用户
  状态: 正常
  注册时间: ${now.toLocaleString('zh-CN')}
----------------------------------------
`;
      
      fs.appendFileSync(usersFilePath, userEntry, 'utf8');
      console.log(`新用户 ${user.email} 已记录到 users-list.txt`);
    } catch (fileError) {
      console.error('保存用户信息到文件失败:', fileError);
    }

    revalidatePath('/login');
    revalidatePath('/register');
    return { success: true, user };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '注册失败' };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        status: true,
      }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new Error('账号已被封禁');
    }

    // 生成token并设置cookie
    const token = generateToken(user.id, user.email, user.role);
    await setAuthCookie(token);

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
      }
    });

    if (!user || user.status !== 'active') {
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
