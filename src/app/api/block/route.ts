export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = (await request.json()) as {
      targetId?: string;
    };
    const { targetId } = body;

    if (!targetId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    if (targetId === userId) {
      return NextResponse.json({ error: '不能拉黑自己' }, { status: 400 });
    }

    const existing = await prisma.blockedUser.findUnique({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: targetId } },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: '已拉黑该用户' });
    }

    await prisma.blockedUser.create({
      data: { blockerId: userId, blockedId: targetId },
    });

    return NextResponse.json({ success: true, message: '已拉黑该用户' });
  } catch (error) {
    console.error('拉黑失败:', error);
    return NextResponse.json({ error: '拉黑失败' }, { status: 500 });
  }
}
