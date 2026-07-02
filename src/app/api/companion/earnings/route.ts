export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const companion = await prisma.companion.findFirst({
      where: { userId },
    });

    if (!companion) {
      return NextResponse.json({ error: '未找到陪玩信息' }, { status: 404 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [thisMonthResult, pendingResult] = await Promise.all([
      prisma.earning.aggregate({
        where: {
          companionId: companion.id,
          createdAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.earning.aggregate({
        where: {
          companionId: companion.id,
          status: 'pending',
        },
        _sum: { amount: true },
      }),
    ]);

    const thisMonthEarnings = Number(thisMonthResult._sum.amount || 0);
    const pendingSettlement = Number(pendingResult._sum.amount || 0);

    const recentEarnings = await prisma.earning.findMany({
      where: { companionId: companion.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const orderIds = recentEarnings.map((e) => e.orderId);
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      select: { id: true, game: true },
    });

    const orderMap = new Map(orders.map((o) => [o.id, o.game]));

    return NextResponse.json({
      stats: {
        totalEarnings: Number(companion.totalEarnings),
        thisMonthEarnings,
        pendingSettlement,
        totalOrders: companion.totalOrders,
      },
      earnings: recentEarnings.map((earning) => ({
        id: earning.id,
        orderId: earning.orderId,
        game: orderMap.get(earning.orderId) || '未知',
        amount: Number(earning.amount),
        status: earning.status,
        createdAt: earning.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('获取收入数据失败:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}
