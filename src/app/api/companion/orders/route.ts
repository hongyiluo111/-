export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
      return NextResponse.json({ error: '未找到伴伴信息' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { companionId: companion.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      userName: order.user.name,
      userEmail: order.user.email,
      game: order.game,
      price: Number(order.price),
      duration: order.duration,
      status: order.status,
      acceptedAt: order.acceptedAt?.toISOString() || null,
      rejectedAt: order.rejectedAt?.toISOString() || null,
      rejectReason: order.rejectReason,
      startedAt: order.startedAt?.toISOString() || null,
      completedAt: order.completedAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('获取伴伴订单失败:', error);
    return NextResponse.json(
      { error: '获取订单失败' },
      { status: 500 }
    );
  }
}
