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
      return NextResponse.json({ error: '钻石不足，请先充值', status: 400 }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { diamonds: { decrement: orderPrice } },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'paid',
          paymentMethod: 'diamonds',
        },
      }),
    ]);

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
