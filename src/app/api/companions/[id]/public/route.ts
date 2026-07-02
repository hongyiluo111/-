export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const companion = await prisma.companion.findFirst({
      where: { id, status: 'active' },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!companion) {
      return NextResponse.json({ error: '陪玩不存在或未上架' }, { status: 404 });
    }

    const [reviews, clubMemberships] = await Promise.all([
      prisma.review.findMany({
        where: { companionId: companion.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { name: true } },
        },
      }),
      prisma.clubMember.findMany({
        where: { userId: companion.userId },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              avatar: true,
              gameId: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      companion: {
        id: companion.id,
        name: companion.name,
        game: companion.game,
        rank: companion.rank,
        price: Number(companion.price),
        description: companion.description,
        avatar: companion.avatar,
        totalOrders: companion.totalOrders,
        rating: companion.rating,
        ratingCount: companion.ratingCount,
        isOnline: companion.isOnline,
        createdAt: companion.createdAt.toISOString(),
        userName: companion.user.name,
      },
      reviews: reviews.map((review) => ({
        id: review.id,
        userId: review.userId,
        userName: review.user.name,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt.toISOString(),
      })),
      clubMemberships: clubMemberships.map((member) => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
        club: {
          id: member.club.id,
          name: member.club.name,
          avatar: member.club.avatar,
          gameId: member.club.gameId,
        },
      })),
    });
  } catch (error) {
    console.error('获取陪玩公开信息失败:', error);
    return NextResponse.json({ error: '获取信息失败' }, { status: 500 });
  }
}
