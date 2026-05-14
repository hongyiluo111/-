import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string; email?: string; newPassword?: string };
    const { token, email, newPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
    }

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        email: email.toLowerCase(),
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: '重置链接无效或已过期' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ success: true, message: '密码重置成功' });
  } catch (error) {
    console.error('Reset password failed:', error);
    return NextResponse.json({ error: '重置密码失败' }, { status: 500 });
  }
}
