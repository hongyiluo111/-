export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { OrderStatus, canTransition } from '@/utils/order-state-machine';

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

    const { orderId, status, force } = await request.json() as { orderId?: string; status?: string; force?: boolean };

    if (!orderId || !status) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, paymentStatus: true, companionId: true, price: true },
    });
    if (!existing) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    const newStatus = status as OrderStatus;
    const currentStatus = existing.status as OrderStatus;

    // 默认走状态机校验；管理员显式传 force=true 可强制（用于异常订单处理）
    if (!force && !canTransition(currentStatus, newStatus)) {
      return NextResponse.json(
        { error: `非法状态转换: ${currentStatus} → ${newStatus}。如需强制操作请传 force=true` },
        { status: 400 }
      );
    }

    // 完成订单必须已支付（即使管理员也不应绕过支付校验，除非显式 force）
    if (newStatus === OrderStatus.COMPLETED && existing.paymentStatus !== 'paid' && !force) {
      return NextResponse.json({ error: '订单未支付，不可标记为已完成（如需强制请传 force=true）' }, { status: 400 });
    }

    // 状态前置条件 + 原子更新，防止并发
    const updatedOrder = await prisma.order.update({
      where: { id: orderId, status: currentStatus },
      data: {
        status: newStatus,
        completedAt: newStatus === OrderStatus.COMPLETED ? new Date() : undefined,
      }
    });

    // 若管理员强制完成订单，需要同步创建收益记录（与 companion/orders/[id]/complete 保持一致）
    if (newStatus === OrderStatus.COMPLETED && existing.companionId) {
      try {
        await prisma.$transaction([
          prisma.earning.create({
            data: {
              companionId: existing.companionId,
              orderId: existing.id,
              amount: existing.price,
              status: 'pending',
            },
          }),
          prisma.companion.update({
            where: { id: existing.companionId },
            data: {
              totalOrders: { increment: 1 },
              totalEarnings: { increment: existing.price },
            },
          }),
        ]);
      } catch (err) {
        // 收益记录可能已存在（订单此前已完成过又重新打开），仅记录日志
        console.error('管理员强制完成订单时创建收益失败:', err);
      }
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    // Prisma P2025：状态前置条件不匹配（订单状态已被其他请求改变）
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ error: '订单状态已变更，请刷新后重试' }, { status: 409 });
    }
    return NextResponse.json({ error: '更新订单状态失败' }, { status: 500 });
  }
}
