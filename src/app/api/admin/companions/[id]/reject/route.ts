import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

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
    const body = await request.json().catch(() => ({}));
    const { reason } = body as { reason?: string };

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
        data: { status: 'inactive' },
      }),
      prisma.adminLog.create({
        data: {
          adminId: auth.user.userId,
          action: 'reject_companion',
          target: id,
          detail: { companionName: companion.name, reason: reason || null },
        },
      }),
    ]);

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
    console.error('拒绝陪玩失败:', error);
    return NextResponse.json({ error: '拒绝陪玩失败' }, { status: 500 });
  }
}
