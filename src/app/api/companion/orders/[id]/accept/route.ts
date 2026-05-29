import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, companionId: companion.id },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: '订单状态不正确，无法接单' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        acceptedAt: updatedOrder.acceptedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('接单失败:', error);
    return NextResponse.json({ error: '接单失败' }, { status: 500 });
  }
}
