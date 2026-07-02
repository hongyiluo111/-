export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单ID' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      select: { id: true, status: true, paymentStatus: true, paymentMethod: true, price: true, userId: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return NextResponse.json(
        { error: '该订单状态无法取消' },
        { status: 400 }
      );
    }

    // 已支付订单需退款
    const needRefund = order.paymentStatus === 'paid';
    const isDiamonds = order.paymentMethod === 'diamonds';

    // 使用事务保证状态与退款原子性
    const refundPrice = order.price;
    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId, status: { in: ['pending', 'accepted', 'in_progress'] } },
        data: {
          status: 'cancelled',
          paymentStatus: needRefund ? 'refunded' : order.paymentStatus,
        },
      }),
      // 钻石支付：立即退还钻石到用户余额
      ...(needRefund && isDiamonds
        ? [prisma.user.update({
            where: { id: order.userId },
            data: { diamonds: { increment: Number(refundPrice) } },
          })]
        : []),
      // 外部支付（alipay/wechat）：标记为 refunded，实际退款需通过退款 API 单独处理
    ]);

    if (needRefund && !isDiamonds) {
      console.warn('订单需通过外部支付通道退款:', { orderId, method: order.paymentMethod, amount: refundPrice });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
      },
      refunded: needRefund,
      refundAmount: needRefund ? Number(refundPrice) : 0,
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    return NextResponse.json(
      { error: '取消订单失败' },
      { status: 500 }
    );
  }
}
