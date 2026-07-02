export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const [companions, users] = await Promise.all([
      prisma.companion.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, status: true },
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      companions: companions.map((companion) => ({
        id: companion.id,
        userId: companion.userId,
        userName: companion.user.name,
        userEmail: companion.user.email,
        name: companion.name,
        game: companion.game,
        rank: companion.rank,
        price: Number(companion.price),
        description: companion.description || '',
        avatar: companion.avatar || '',
        status: companion.status,
        createdAt: companion.createdAt.toISOString(),
        updatedAt: companion.updatedAt.toISOString(),
      })),
      users,
    });
  } catch (error) {
    console.error('获取陪玩列表失败:', error);
    return NextResponse.json({ error: '获取陪玩列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const {
      userId,
      name,
      game,
      rank,
      price,
      description = '',
      avatar = '',
      status = 'pending',
    } = body as {
      userId?: string;
      name?: string;
      game?: string;
      rank?: string;
      price?: number;
      description?: string;
      avatar?: string;
      status?: string;
    };

    if (!userId || !name || !game || !rank || price === undefined || price === null) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, status: true } });
    if (!owner) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    if (owner.status !== 'active') {
      return NextResponse.json({ error: '目标用户状态异常' }, { status: 400 });
    }

    const newCompanion = await prisma.companion.create({
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
        ...newCompanion,
        price: Number(newCompanion.price),
        createdAt: newCompanion.createdAt.toISOString(),
        updatedAt: newCompanion.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('创建陪玩失败:', error);
    return NextResponse.json({ error: '创建陪玩失败' }, { status: 500 });
  }
}
