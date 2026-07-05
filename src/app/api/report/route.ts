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
      targetType?: string;
      reason?: string;
    };
    const { targetId, targetType, reason } = body;

    if (!targetId || !targetType || !reason) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const validTypes = ['user', 'companion', 'order'];
    if (!validTypes.includes(targetType)) {
      return NextResponse.json({ error: '无效的举报类型' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        targetId,
        targetType,
        reason: reason.slice(0, 500),
      },
    });

    return NextResponse.json({ success: true, report: { id: report.id } }, { status: 201 });
  } catch (error) {
    console.error('创建举报失败:', error);
    return NextResponse.json({ error: '创建举报失败' }, { status: 500 });
  }
}
