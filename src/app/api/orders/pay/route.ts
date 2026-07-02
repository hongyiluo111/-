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

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, diamonds: true, status: true },
    });

    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: '用户状态异常' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id, paymentStatus: 'unpaid' },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在或已支付' }, { status: 404 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ error: '订单已取消' }, { status: 400 });
    }

    const orderPrice = Number(order.price);

    if (user.diamonds < orderPrice) {
      return NextResponse.json({ error: '钻石不足，请先充值' }, { status: 400 });
    }

    // 使用带条件的原子更新防止 TOCTOU 竞态：只有 diamonds >= orderPrice 时才扣减
    const paymentId = `diamonds-${order.id}-${Date.now()}`;
    const updateResult = await prisma.user.updateMany({
      where: { id: user.id, diamonds: { gte: orderPrice } },
      data: { diamonds: { decrement: orderPrice } },
    });

    if (updateResult.count === 0) {
      // 余额在并发请求中被消耗
      return NextResponse.json({ error: '钻石不足，请先充值' }, { status: 400 });
    }

    // 余额扣减成功，更新订单状态（带状态前置条件防重复支付）
    try {
      await prisma.order.update({
        where: { id: order.id, paymentStatus: 'unpaid' },
        data: {
          paymentStatus: 'paid',
          paymentMethod: 'diamonds',
          paymentId,
        },
      });
    } catch (err) {
      // 订单已被其他并发请求支付，回滚钻石
      await prisma.user.update({
        where: { id: user.id },
        data: { diamonds: { increment: orderPrice } },
      });
      if (err && typeof err === 'object' && 'code' in err && err.code === 'P2025') {
        return NextResponse.json({ error: '订单已支付，请勿重复操作' }, { status: 409 });
      }
      throw err;
    }

    return NextResponse.json({
      success: true,
      message: '支付成功',
      remainingDiamonds: user.diamonds - orderPrice,
    });
  } catch (error) {
    console.error('钻石支付失败:', error);
    return NextResponse.json({ error: '支付失败' }, { status: 500 });
  }
}
