export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'members';

    const where: Record<string, unknown> = { status: 'active' };
    if (game) {
      where.gameId = game;
    }
    if (search) {
      where.name = { contains: search };
    }

    const orderBy =
      sort === 'newest'
        ? { createdAt: 'desc' as const }
        : { memberCount: 'desc' as const };

    const clubs = await prisma.club.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { members: true } },
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      clubs: clubs.map((club) => ({
        id: club.id,
        name: club.name,
        description: club.description,
        avatar: club.avatar,
        banner: club.banner,
        gameId: club.gameId,
        ownerId: club.ownerId,
        ownerName: club.owner.name,
        memberCount: club.memberCount,
        status: club.status,
        members: club._count.members,
        createdAt: club.createdAt.toISOString(),
        updatedAt: club.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('获取俱乐部列表失败:', error);
    return NextResponse.json({ error: '获取俱乐部列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, gameId, avatar, banner } = body as {
      name?: string;
      description?: string;
      gameId?: string;
      avatar?: string;
      banner?: string;
    };

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '俱乐部名称不能为空' }, { status: 400 });
    }
    if (!gameId) {
      return NextResponse.json({ error: '请选择游戏' }, { status: 400 });
    }

    const existing = await prisma.club.findUnique({ where: { name: name.trim() } });
    if (existing) {
      return NextResponse.json({ error: '俱乐部名称已存在' }, { status: 409 });
    }

    const club = await prisma.$transaction(async (tx) => {
      const created = await tx.club.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          gameId,
          avatar: avatar || null,
          banner: banner || null,
          ownerId: userId,
          memberCount: 1,
        },
      });

      await tx.clubMember.create({
        data: {
          clubId: created.id,
          userId,
          role: 'owner',
        },
      });

      return created;
    });

    return NextResponse.json({
      club: {
        id: club.id,
        name: club.name,
        description: club.description,
        avatar: club.avatar,
        banner: club.banner,
        gameId: club.gameId,
        ownerId: club.ownerId,
        memberCount: club.memberCount,
        status: club.status,
        createdAt: club.createdAt.toISOString(),
        updatedAt: club.updatedAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('创建俱乐部失败:', error);
    return NextResponse.json({ error: '创建俱乐部失败' }, { status: 500 });
  }
}
