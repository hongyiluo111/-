import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const companions = await prisma.companion.findMany({
      where: { status: 'active' },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      companions: companions.map((companion) => ({
        id: companion.id,
        name: companion.name,
        game: companion.game,
        rank: companion.rank,
        price: Number(companion.price),
        description: companion.description || '',
        avatar: companion.avatar || '',
        userId: companion.userId,
        userName: companion.user.name,
      })),
    });
  } catch (error) {
    console.error('获取陪玩列表失败:', error);
    return NextResponse.json({ companions: [] });
  }
}
