import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 分钟

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIds = searchParams.get('userIds');

    if (!userIds) {
      return NextResponse.json({ error: '缺少 userIds 参数' }, { status: 400 });
    }

    const ids = userIds.split(',').filter(Boolean);

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, lastSeen: true },
    });

    const now = Date.now();
    const statusMap: Record<string, boolean> = {};

    for (const user of users) {
      statusMap[user.id] = now - user.lastSeen.getTime() < ONLINE_THRESHOLD_MS;
    }

    return NextResponse.json({ status: statusMap });
  } catch (error) {
    console.error('查询在线状态失败:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
