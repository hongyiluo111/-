import { prisma } from '@/lib/db';

type SoftDeleteModel = 'user' | 'companion' | 'order';

interface SoftDeleteOptions {
  model: SoftDeleteModel;
  id: string;
  /** 当前操作者 userId，必填，用于权限校验 */
  operatorUserId: string;
  /** 当前操作者角色，必填。'admin' 拥有全部权限 */
  operatorRole: string;
}

export async function softDelete({ model, id, operatorUserId, operatorRole }: SoftDeleteOptions) {
  const now = new Date();
  const isAdmin = operatorRole === 'admin';

  switch (model) {
    case 'user': {
      // 非 admin 只能删除自己；admin 可删除任意用户
      if (!isAdmin && operatorUserId !== id) {
        throw new Error('无权删除其他用户');
      }
      // 级联软删除关联数据（事务保证原子性）
      return prisma.$transaction([
        prisma.user.update({ where: { id }, data: { deletedAt: now } }),
        prisma.companion.updateMany({ where: { userId: id, deletedAt: null }, data: { deletedAt: now } }),
        prisma.order.updateMany({ where: { userId: id, deletedAt: null }, data: { deletedAt: now } }),
      ]);
    }

    case 'companion': {
      // 仅 admin 或 companion 所属用户可软删除
      const companion = await prisma.companion.findUnique({
        where: { id },
        select: { userId: true, deletedAt: true },
      });
      if (!companion) throw new Error('陪玩不存在');
      if (companion.deletedAt) throw new Error('陪玩已删除');
      if (!isAdmin && companion.userId !== operatorUserId) {
        throw new Error('无权删除此陪玩');
      }
      return prisma.$transaction([
        prisma.companion.update({ where: { id }, data: { deletedAt: now } }),
        prisma.order.updateMany({ where: { companionId: id, deletedAt: null }, data: { deletedAt: now } }),
      ]);
    }

    case 'order': {
      const order = await prisma.order.findUnique({
        where: { id },
        select: { userId: true, companionId: true, deletedAt: true },
      });
      if (!order) throw new Error('订单不存在');
      if (order.deletedAt) throw new Error('订单已删除');
      // 仅 admin 或订单用户或对应陪玩可软删除
      if (!isAdmin && order.userId !== operatorUserId) {
        const companion = await prisma.companion.findUnique({
          where: { id: order.companionId },
          select: { userId: true },
        });
        if (!companion || companion.userId !== operatorUserId) {
          throw new Error('无权删除此订单');
        }
      }
      return prisma.order.update({ where: { id }, data: { deletedAt: now } });
    }

    default:
      throw new Error(`不支持的模型: ${model}`);
  }
}

export async function restore({ model, id, operatorUserId, operatorRole }: SoftDeleteOptions) {
  const isAdmin = operatorRole === 'admin';

  switch (model) {
    case 'user': {
      if (!isAdmin && operatorUserId !== id) {
        throw new Error('无权恢复其他用户');
      }
      // 检查父表状态：恢复用户时无需检查
      return prisma.user.update({ where: { id }, data: { deletedAt: null } });
    }

    case 'companion': {
      if (!isAdmin) {
        const companion = await prisma.companion.findUnique({
          where: { id },
          select: { userId: true },
        });
        if (!companion || companion.userId !== operatorUserId) {
          throw new Error('无权恢复此陪玩');
        }
      }
      // 检查父表：所属用户必须未处于软删除状态
      const companion = await prisma.companion.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (companion) {
        const user = await prisma.user.findUnique({
          where: { id: companion.userId },
          select: { deletedAt: true },
        });
        if (user?.deletedAt) {
          throw new Error('所属用户已软删除，请先恢复用户');
        }
      }
      return prisma.companion.update({ where: { id }, data: { deletedAt: null } });
    }

    case 'order': {
      if (!isAdmin) {
        const order = await prisma.order.findUnique({
          where: { id },
          select: { userId: true },
        });
        if (!order || order.userId !== operatorUserId) {
          throw new Error('无权恢复此订单');
        }
      }
      return prisma.order.update({ where: { id }, data: { deletedAt: null } });
    }

    default:
      throw new Error(`不支持的模型: ${model}`);
  }
}

export function getNotDeletedFilter() {
  return { deletedAt: null };
}

export function getDeletedFilter() {
  return { deletedAt: { not: null } };
}
