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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todayOrders, todayEarningsResult, pendingOrders] = await Promise.all([
      prisma.order.count({
        where: {
          companionId: companion.id,
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.order.aggregate({
        where: {
          companionId: companion.id,
          status: 'completed',
          createdAt: { gte: startOfToday },
        },
        _sum: { price: true },
      }),
      prisma.order.count({
        where: {
          companionId: companion.id,
          status: 'pending',
        },
      }),
    ]);

    const todayEarnings = Number(todayEarningsResult._sum.price || 0);

    const recentOrders = await prisma.order.findMany({
      where: { companionId: companion.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      stats: {
        todayOrders,
        todayEarnings,
        pendingOrders,
        rating: companion.rating,
        isOnline: companion.isOnline,
        totalOrders: companion.totalOrders,
        totalEarnings: Number(companion.totalEarnings),
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        userId: order.userId,
        userName: order.user.name,
        game: order.game,
        price: Number(order.price),
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}
