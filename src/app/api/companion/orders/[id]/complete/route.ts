export const dynamic = 'force-dynamic';

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
      select: { id: true, status: true, paymentStatus: true, price: true },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (order.status !== 'in_progress') {
      return NextResponse.json({ error: '订单状态不正确，无法完成服务' }, { status: 400 });
    }

    // 校验支付状态：未支付订单不可完成（防止白嫖）
    if (order.paymentStatus !== 'paid') {
      return NextResponse.json({ error: '订单尚未支付，无法完成服务' }, { status: 400 });
    }

    // 使用事务并在 update 上附加状态前置条件，防止并发重复完成
    try {
      const [updatedOrder] = await prisma.$transaction([
        prisma.order.update({
          where: { id, status: 'in_progress' },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        }),
        prisma.earning.create({
          data: {
            companionId: companion.id,
            orderId: order.id,
            amount: order.price,
            status: 'pending',
          },
        }),
        prisma.companion.update({
          where: { id: companion.id },
          data: {
            totalOrders: { increment: 1 },
            totalEarnings: { increment: order.price },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        order: {
          id: updatedOrder.id,
          status: updatedOrder.status,
          completedAt: updatedOrder.completedAt?.toISOString() || null,
        },
      });
    } catch (err) {
      // Prisma 在 where 条件不匹配时抛 P2025，说明订单状态已被其他并发请求改变
      if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
        return NextResponse.json({ error: '订单状态已变更，请刷新后重试' }, { status: 409 });
      }
      throw err;
    }
  } catch (error) {
    console.error('完成服务失败:', error);
    return NextResponse.json({ error: '完成服务失败' }, { status: 500 });
  }
}
