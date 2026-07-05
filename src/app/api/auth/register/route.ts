export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sanitize } from '@/lib/utils';
import bcrypt from 'bcrypt';
import { generateToken, setAuthCookie } from '@/lib/jwt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 32;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: '姓名、邮箱和密码不能为空' }, { status: 400 });
    }

    // 邮箱格式校验
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: '邮箱格式不正确' }, { status: 400 });
    }

    // 密码强度校验（与 reset-password / profile/password 保持一致）
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ success: false, error: `密码长度至少 ${MIN_PASSWORD_LENGTH} 位` }, { status: 400 });
    }

    // 用户名长度校验
    if (typeof name !== 'string' || name.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ success: false, error: `姓名长度不能超过 ${MAX_NAME_LENGTH} 个字符` }, { status: 400 });
    }

    // 检查邮箱是否已被未软删除的用户占用
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true },
    });
    if (existingUser && !existingUser.deletedAt) {
      return NextResponse.json({ success: false, error: '该邮箱已被注册' }, { status: 409 });
    }
    if (existingUser && existingUser.deletedAt) {
      return NextResponse.json({ success: false, error: '该邮箱曾注册但已注销，请联系管理员或使用其他邮箱' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: sanitize(name), email, password: hashedPassword, role: 'user', status: 'active' },
      select: { id: true, email: true, name: true, role: true }
    });

    // 复用统一的 token 生成逻辑（含密钥长度校验）
    const token = generateToken(user.id, user.email, user.role, false);
    const response = NextResponse.json({ success: true, user });
    await setAuthCookie(token, false);

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, error: '注册失败' }, { status: 500 });
  }
}

