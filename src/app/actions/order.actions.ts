'use server';

import { prisma } from '@/lib/db';
import { OrderStatus, canTransition } from '@/utils/order-state-machine';
import { revalidatePath } from 'next/cache';
import { getAuthCookie, verifyToken } from '@/lib/jwt';
import { redirect } from 'next/navigation';

// 合法的支付状态枚举
const VALID_PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

// 从 cookie 获取当前登录用户ID，未登录返回 null
async function getCurrentUserId(): Promise<string | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.userId ?? null;
}

export async function createOrder(companionId: string, game: string, price: number) {
  try {
    // 鉴权：必须登录
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '请先登录' };
    }

    const companion = await prisma.companion.findUnique({
      where: { id: companionId },
      select: { userId: true, status: true, name: true, rank: true, avatar: true, price: true }
    });

    if (!companion) {
      throw new Error('陪玩不存在');
    }

    if (companion.status !== 'active') {
      throw new Error('陪玩当前不可用');
    }

    // 价格一致性校验：客户端传入的 price 必须与陪玩实际价格一致
    const expectedPrice = Number(companion.price);
    if (Math.abs(expectedPrice - price) > 0.01) {
      throw new Error('订单价格异常，请刷新后重试');
    }

    // 不允许向自己下单
    if (companion.userId === userId) {
      throw new Error('不能向自己下单');
    }

    // 事务保证订单与通知原子性
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          userId,
          companionId,
          companionName: companion.name,
          companionRank: companion.rank,
          companionAvatar: companion.avatar || '',
          game,
          price: expectedPrice,
          status: 'pending',
          paymentStatus: 'unpaid'
        }
      }),
      // 发送订单通知到陪玩
      prisma.notification.create({
        data: {
          userId: companion.userId,
          type: 'new_order',
          title: '新订单',
          message: `有人预约了您的陪玩服务，游戏：${game}`,
          data: { order_id: '' } // order_id 在事务后回填不必要，前端通过列表查询
        }
      }),
    ]);

    revalidatePath('/orders');
    return { success: true, order };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '创建订单失败' };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    // 鉴权：必须登录
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '请先登录' };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, userId: true, companionId: true, deletedAt: true },
    });

    if (!order || order.deletedAt) {
      throw new Error('订单不存在');
    }

    // 权限校验：订单的所属用户或对应陪玩才能操作
    const companion = await prisma.companion.findFirst({
      where: { id: order.companionId, userId },
      select: { id: true },
    });
    const isOrderOwner = order.userId === userId;
    const isOrderCompanion = !!companion;
    if (!isOrderOwner && !isOrderCompanion) {
      throw new Error('无权操作此订单');
    }

    // 检查状态转换是否有效
    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new Error('无效的状态转换');
    }

    // 状态前置条件 + 原子更新，防止并发
    const updatedOrder = await prisma.order.update({
      where: { id: orderId, status: order.status },
      data: {
        status: newStatus,
        ...(newStatus === 'completed' && { completedAt: new Date() }),
      }
    });

    revalidatePath('/orders');
    return { success: true, order: updatedOrder };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '更新订单状态失败' };
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentMethod?: string,
  paymentId?: string
) {
  try {
    // 鉴权：必须登录
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: '请先登录' };
    }

    // 枚举校验
    if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      throw new Error(`非法的支付状态，允许值：${VALID_PAYMENT_STATUSES.join(', ')}`);
    }

    // 只允许 paid -> refunded 的回退（用户/陪玩不可直接把 unpaid 改为 paid，支付必须走 pay 路由）
    if (paymentStatus === 'paid') {
      throw new Error('支付状态修改受限：请通过 /api/orders/pay 路由完成支付');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, paymentStatus: true, deletedAt: true },
    });

    if (!order || order.deletedAt) {
      throw new Error('订单不存在');
    }

    // 权限校验：仅订单所属用户可改自己的支付状态
    if (order.userId !== userId) {
      throw new Error('无权操作此订单');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId, paymentStatus: order.paymentStatus },
      data: {
        paymentStatus,
        ...(paymentMethod && { paymentMethod }),
        ...(paymentId && { paymentId }),
      }
    });

    revalidatePath('/orders');
    return { success: true, order: updatedOrder };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '更新支付状态失败' };
  }
}

export async function getUserOrders() {
  try {
    // 鉴权：必须登录，从 cookie 获取 userId（不再信任参数）
    const userId = await getCurrentUserId();
    if (!userId) {
      redirect('/login');
    }

    // 过滤软删除订单
    const orders = await prisma.order.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, orders };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '获取订单失败' };
  }
}
