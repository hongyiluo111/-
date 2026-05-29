import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCompanions,
      totalOrders,
      totalRevenueResult,
      pendingReviews,
      todayOrders,
      todayUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.companion.count({ where: { deletedAt: null } }),
      prisma.order.count({ where: { deletedAt: null } }),
      prisma.order.aggregate({
        where: { deletedAt: null, status: 'completed' },
        _sum: { price: true },
      }),
      prisma.companion.count({ where: { status: 'pending', deletedAt: null } }),
      prisma.order.count({
        where: { deletedAt: null, createdAt: { gte: startOfToday } },
      }),
      prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: startOfToday } },
      }),
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.price || 0);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCompanions,
        totalOrders,
        totalRevenue,
        pendingReviews,
        todayOrders,
        todayUsers,
      },
    });
  } catch (error) {
    console.error('获取平台统计失败:', error);
    return NextResponse.json({ error: '获取平台统计失败' }, { status: 500 });
  }
}
