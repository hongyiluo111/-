import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

function getDateRange(days: number) {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function groupByDate<T extends { createdAt: Date }>(
  items: T[],
  dates: string[]
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const date of dates) {
    map[date] = 0;
  }
  for (const item of items) {
    const key = item.createdAt.toISOString().slice(0, 10);
    if (key in map) {
      map[key]++;
    }
  }
  return map;
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const days = 7;
    const dates = getDateRange(days);

    const startDate = new Date(dates[0]);
    startDate.setHours(0, 0, 0, 0);

    const [orders, users, completedOrders] = await Promise.all([
      prisma.order.findMany({
        where: { deletedAt: null, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.user.findMany({
        where: { deletedAt: null, createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.order.findMany({
        where: {
          deletedAt: null,
          status: 'completed',
          createdAt: { gte: startDate },
        },
        select: { createdAt: true, price: true },
      }),
    ]);

    const orderCounts = groupByDate(orders, dates);
    const userCounts = groupByDate(users, dates);

    const revenueMap: Record<string, number> = {};
    for (const date of dates) {
      revenueMap[date] = 0;
    }
    for (const order of completedOrders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (key in revenueMap) {
        revenueMap[key] += Number(order.price);
      }
    }

    const dailyOrders = dates.map((date) => ({ date, count: orderCounts[date] }));
    const dailyUsers = dates.map((date) => ({ date, count: userCounts[date] }));
    const dailyRevenue = dates.map((date) => ({ date, amount: revenueMap[date] }));

    return NextResponse.json({
      trends: { dailyOrders, dailyUsers, dailyRevenue },
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    return NextResponse.json({ error: '获取趋势数据失败' }, { status: 500 });
  }
}
