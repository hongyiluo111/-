export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const game = searchParams.get('game');
    const q = searchParams.get('q');
    const sort = searchParams.get('sort') || 'memberCount';
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const where: Record<string, unknown> = { status: 'active' };
    
    if (game) {
      where.gameId = game;
    }
    
    if (q) {
      where.name = { contains: q };
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'memberCount':
      default:
        orderBy = { memberCount: 'desc' };
        break;
    }

    const clubs = await prisma.club.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        owner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      clubs: clubs.map((club) => ({
        id: club.id,
        name: club.name,
        gameId: club.gameId,
        avatar: club.avatar,
        memberCount: club.memberCount,
        description: club.description,
        ownerId: club.ownerId,
        ownerName: club.owner.name,
        createdAt: club.createdAt,
      })),
    });
  } catch (error) {
    console.error('获取俱乐部排行失败:', error);
    return NextResponse.json({ error: '获取俱乐部排行失败' }, { status: 500 });
  }
}
