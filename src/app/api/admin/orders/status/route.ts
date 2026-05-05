import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        completedAt: status === 'completed' ? new Date() : undefined
      }
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
  }
}
