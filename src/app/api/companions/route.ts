import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CACHE_TTL = 30000; // 30 秒缓存
let cache: { data: unknown; timestamp: number } | null = null;

export async function GET() {
  try {
    const now = Date.now();
    if (cache && now - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const companions = await prisma.companion.findMany({
      where: { status: 'active' },
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
      })),
    };

    cache = { data, timestamp: now };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ companions: [] });
  }
}
