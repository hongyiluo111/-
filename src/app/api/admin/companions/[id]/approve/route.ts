export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { invalidateCompanionListCache } from '@/lib/companion-cache';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { id } = await params;

    const companion = await prisma.companion.findUnique({ where: { id } });
    if (!companion) {
      return NextResponse.json({ error: '陪玩不存在' }, { status: 404 });
    }

    if (companion.status !== 'pending') {
      return NextResponse.json({ error: '该陪玩不在待审核状态' }, { status: 400 });
    }

    const [updatedCompanion] = await prisma.$transaction([
      prisma.companion.update({
        where: { id },
        data: { status: 'active' },
      }),
      prisma.user.update({
        where: { id: companion.userId },
        data: { role: 'companion' },
      }),
      prisma.adminLog.create({
        data: {
          adminId: auth.user.userId,
          action: 'approve_companion',
          target: id,
          detail: { companionName: companion.name, game: companion.game },
        },
      }),
    ]);

    // 陪玩审核通过变为 active，立即失效列表缓存
    invalidateCompanionListCache();

    return NextResponse.json({
      companion: {
        ...updatedCompanion,
        price: Number(updatedCompanion.price),
        totalEarnings: Number(updatedCompanion.totalEarnings),
        createdAt: updatedCompanion.createdAt.toISOString(),
        updatedAt: updatedCompanion.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('审核通过陪玩失败:', error);
    return NextResponse.json({ error: '审核通过陪玩失败' }, { status: 500 });
  }
}
