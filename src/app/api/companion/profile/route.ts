import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const companion = await prisma.companion.findFirst({
      where: { userId },
    });

    if (!companion) {
      return NextResponse.json({ error: '未找到陪玩信息' }, { status: 404 });
    }

    return NextResponse.json({
      companion: {
        id: companion.id,
        name: companion.name,
        game: companion.game,
        rank: companion.rank,
        price: Number(companion.price),
        description: companion.description,
        avatar: companion.avatar,
        status: companion.status,
        rating: companion.rating,
        ratingCount: companion.ratingCount,
        totalOrders: companion.totalOrders,
        totalEarnings: Number(companion.totalEarnings),
        isOnline: companion.isOnline,
        createdAt: companion.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('获取陪玩资料失败:', error);
    return NextResponse.json({ error: '获取资料失败' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const companion = await prisma.companion.findFirst({
      where: { userId },
    });

    if (!companion) {
      return NextResponse.json({ error: '未找到陪玩信息' }, { status: 404 });
    }

    const body = await request.json();
    const { name, game, rank, price, description, avatar } = body;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: '昵称不能为空' }, { status: 400 });
    }

    if (price !== undefined && (Number(price) <= 0 || isNaN(Number(price)))) {
      return NextResponse.json({ error: '价格必须大于0' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (game !== undefined) updateData.game = game;
    if (rank !== undefined) updateData.rank = rank;
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar?.trim() || null;

    const updated = await prisma.companion.update({
      where: { id: companion.id },
      data: updateData,
    });

    return NextResponse.json({
      companion: {
        id: updated.id,
        name: updated.name,
        game: updated.game,
        rank: updated.rank,
        price: Number(updated.price),
        description: updated.description,
        avatar: updated.avatar,
        status: updated.status,
        rating: updated.rating,
        ratingCount: updated.ratingCount,
        totalOrders: updated.totalOrders,
        totalEarnings: Number(updated.totalEarnings),
        isOnline: updated.isOnline,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('更新陪玩资料失败:', error);
    return NextResponse.json({ error: '更新资料失败' }, { status: 500 });
  }
}
