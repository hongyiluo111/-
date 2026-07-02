export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const companions = await prisma.companion.groupBy({
      by: ['game'],
      where: { status: 'active' },
      _count: { id: true },
    });

    const counts: Record<string, number> = {};
    for (const item of companions) {
      counts[item.game] = item._count.id;
    }

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('获取陪玩数量失败:', error);
    return NextResponse.json({ counts: {} });
  }
}
