'use server';

import { prisma } from '@/lib/db';
import { OrderStatus, canTransition } from '@/utils/order-state-machine';
import { revalidatePath } from 'next/cache';

export async function createOrder(userId: string, companionId: string, game: string, price: number) {
  try {
    const companion = await prisma.companion.findUnique({
      where: { id: companionId },
      select: { userId: true, status: true, name: true, rank: true, avatar: true }
    });

    if (!companion) {
      throw new Error('陪玩不存在');
    }

    if (companion.status !== 'active') {
      throw new Error('陪玩当前不可用');
    }

    const order = await prisma.order.create({
      data: {
        userId,
        companionId,
        companionName: companion.name,
        companionRank: companion.rank,
        companionAvatar: companion.avatar || '',
        game,
        price,
        status: 'pending',
        paymentStatus: 'unpaid'
      }
    });

    // 发送订单通知到陪玩
    await prisma.notification.create({
      data: {
        userId: companion.userId,
        type: 'new_order',
        title: '新订单',
        message: `有人预约了您的陪玩服务，游戏：${game}`,
        data: { order_id: order.id }
      }
    });

    revalidatePath('/orders');
    return { success: true, order };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '创建订单失败' };
  }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    // 查找订单
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    // 检查状态转换是否有效
    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new Error('无效的状态转换');
    }

    // 更新订单状态
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(newStatus === 'completed' && { completedAt: new Date() })
      }
    });

    revalidatePath('/orders');
    return { success: true, order: updatedOrder };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '更新订单状态失败' };
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string, paymentMethod?: string, paymentId?: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('订单不存在');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
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

export async function getUserOrders(userId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, orders };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : '获取订单失败' };
  }
}
