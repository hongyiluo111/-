export const dynamic = 'force-dynamic';

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

    const reviews = await prisma.review.findMany({
      where: { companionId: companion.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        userId: review.userId,
        userName: review.user.name,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt.toISOString(),
      })),
      averageRating: companion.rating,
      totalReviews: companion.ratingCount,
    });
  } catch (error) {
    console.error('获取评价失败:', error);
    return NextResponse.json({ error: '获取评价失败' }, { status: 500 });
  }
}
