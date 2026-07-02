export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const TOKEN_EXPIRES_HOURS = 1;
// 限流：每邮箱每分钟最多 1 次重置请求
const recentRequests = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: '邮箱不能为空' }, { status: 400 });
    }

    // 简单限流：防止邮件轰炸
    const now = Date.now();
    const lastReq = recentRequests.get(email) || 0;
    if (now - lastReq < 60 * 1000) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
    }
    recentRequests.set(email, now);

    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      // 生成密码重置令牌并写入数据库
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(now + TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

      await prisma.passwordReset.create({
        data: {
          token,
          email: user.email,
          expiresAt,
          used: false,
        },
      });

      // TODO: 接入邮件服务发送重置链接
      // 当前先记录日志（生产环境必须改为真实邮件发送，且日志不应包含 token 明文）
      console.log(`密码重置链接已生成: /reset-password?token=${token}&email=${encodeURIComponent(user.email)}`);
    }

    // 无论用户是否存在都返回相同提示，防止邮箱枚举
    return NextResponse.json({
      message: '如果该邮箱已注册，我们已发送密码重置说明，请注意查收。',
    });
  } catch (error) {
    console.error('Forgot password failed:', error);
    return NextResponse.json({ error: '请求失败，请稍后重试' }, { status: 500 });
  }
}
