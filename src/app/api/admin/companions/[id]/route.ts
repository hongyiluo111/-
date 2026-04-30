import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return { error: NextResponse.json({ error: '未登录' }, { status: 401 }) };
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return { error: NextResponse.json({ error: '无权限' }, { status: 403 }) };
  }

  return { user };
}

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const auth = getAdminFromRequest(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { id } = params;
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

    if (!userId || !name || !game || !rank || price === undefined || price === null || !status) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, status: true } });
    if (!owner) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    if (owner.status !== 'active') {
      return NextResponse.json({ error: '目标用户状态异常' }, { status: 400 });
    }

    const updated = await prisma.companion.update({
      where: { id },
      data: {
        userId,
        name: name.trim(),
        game: game.trim(),
        rank: rank.trim(),
        price: Number(price),
        description: description?.trim() || null,
        avatar: avatar?.trim() || null,
        status,
      },
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
  const auth = getAdminFromRequest(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const { id } = params;

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
