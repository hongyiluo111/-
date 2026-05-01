import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      userEmail: order.user.email,
      companionId: order.companionId,
      companionName: order.companionName,
      companionRank: order.companionRank,
      companionAvatar: order.companionAvatar,
      game: order.game,
      price: Number(order.price),
      status: order.status,
      paymentId: order.paymentId,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      completedAt: order.completedAt?.toISOString() || null,
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('获取订单失败:', error);
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 });
  }
}
