import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      // 这里预留邮件发送逻辑，当前版本先记录日志并返回成功提示
      console.log(`Password reset requested for ${user.email} (${user.id})`);
    }

    return NextResponse.json({
      message: '如果该邮箱已注册，我们已发送密码重置说明，请注意查收。',
    });
  } catch (error) {
    console.error('Forgot password failed:', error);
    return NextResponse.json({ error: '请求失败，请稍后重试' }, { status: 500 });
  }
}
