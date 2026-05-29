import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, name, game, rank, price, description, avatar, status } = body as {
      userId?: string;
      name?: string;
      game?: string;
      rank?: string;
      price?: number;
      description?: string;
      avatar?: string;
      status?: string;
    };

    const existing = await prisma.companion.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: '陪玩不存在' }, { status: 404 });
    }

    if (status && !['pending', 'active', 'paused', 'inactive'].includes(status)) {
      return NextResponse.json({ error: '状态不合法' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (userId !== undefined) updateData.userId = userId;
    if (name !== undefined) updateData.name = name.trim();
    if (game !== undefined) updateData.game = game.trim();
    if (rank !== undefined) updateData.rank = rank.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar?.trim() || null;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '缺少更新参数' }, { status: 400 });
    }

    const updated = await prisma.companion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      companion: {
        ...updated,
        price: Number(updated.price),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('更新陪玩失败:', error);
    return NextResponse.json({ error: '更新陪玩失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { id } = await params;

    const existing = await prisma.companion.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: '陪玩不存在' }, { status: 404 });
    }

    await prisma.companion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除陪玩失败:', error);
    return NextResponse.json({ error: '删除陪玩失败' }, { status: 500 });
  }
}
