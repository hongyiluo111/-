export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'rating';
    const game = searchParams.get('game');
    const q = searchParams.get('q');
    const online = searchParams.get('online');
    const priceRange = searchParams.get('priceRange');
    const rank = searchParams.get('rank');
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

    const where: Record<string, unknown> = { status: 'active' };
    
    if (game) {
      where.game = game;
    }
    
    if (q) {
      where.name = { contains: q };
    }
    
    if (online === 'true') {
      where.isOnline = true;
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (!isNaN(min)) {
        where.price = { gte: min };
        if (!isNaN(max) && max > 0) {
          (where.price as Record<string, number>).lte = max;
        }
      }
    }
    
    if (rank) {
      where.rank = rank;
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case 'orders':
        orderBy = { totalOrders: 'desc' };
        break;
      case 'earnings':
        orderBy = { totalEarnings: 'desc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
      default:
        orderBy = { rating: 'desc' };
        break;
    }

    const companions = await prisma.companion.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({
      companions: companions.map((c) => ({
        id: c.id,
        name: c.name,
        game: c.game,
        rank: c.rank,
        price: Number(c.price),
        avatar: c.avatar,
        rating: c.rating,
        ratingCount: c.ratingCount,
        totalOrders: c.totalOrders,
        totalEarnings: Number(c.totalEarnings),
        userId: c.userId,
        userName: c.user.name,
        isOnline: c.isOnline,
      })),
    });
  } catch (error) {
    console.error('获取陪玩排行失败:', error);
    return NextResponse.json({ error: '获取陪玩排行失败' }, { status: 500 });
  }
}
