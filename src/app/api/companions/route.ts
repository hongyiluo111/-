export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCompanionListCache, setCompanionListCache } from '@/lib/companion-cache';

export async function GET() {
  try {
    const cached = getCompanionListCache();
    if (cached) {
      return NextResponse.json(cached.data);
    }

    const companions = await prisma.companion.findMany({
      where: { status: 'active', deletedAt: null },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = {
      companions: companions.map((c) => ({
        id: c.id,
        name: c.name,
        game: c.game,
        rank: c.rank,
        price: Number(c.price),
        description: c.description || '',
        avatar: c.avatar || '',
        userId: c.userId,
        userName: c.user.name,
        rating: Number(c.rating) || 0,
        ratingCount: c.ratingCount || 0,
        totalOrders: c.totalOrders || 0,
      })),
    };

    setCompanionListCache(data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ companions: [] });
  }
}
