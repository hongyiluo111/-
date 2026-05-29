import { prisma } from '@/lib/db';

type SoftDeleteModel = 'user' | 'companion' | 'order';

interface SoftDeleteOptions {
  model: SoftDeleteModel;
  id: string;
  userId?: string;
}

export async function softDelete({ model, id, userId }: SoftDeleteOptions) {
  const now = new Date();
  
  switch (model) {
    case 'user':
      if (userId && userId !== id) {
        throw new Error('无权删除其他用户');
      }
      return prisma.user.update({
        where: { id },
        data: { deletedAt: now },
      });
    
    case 'companion':
      return prisma.companion.update({
        where: { id },
        data: { deletedAt: now },
      });
    
    case 'order':
      return prisma.order.update({
        where: { id },
        data: { deletedAt: now },
      });
    
    default:
      throw new Error(`不支持的模型: ${model}`);
  }
}

export async function restore({ model, id }: Omit<SoftDeleteOptions, 'userId'>) {
  switch (model) {
    case 'user':
      return prisma.user.update({
        where: { id },
        data: { deletedAt: null },
      });
    
    case 'companion':
      return prisma.companion.update({
        where: { id },
        data: { deletedAt: null },
      });
    
    case 'order':
      return prisma.order.update({
        where: { id },
        data: { deletedAt: null },
      });
    
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
