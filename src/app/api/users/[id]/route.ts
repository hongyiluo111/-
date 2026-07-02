export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        role: true,
        _count: {
          select: {
            orders: true,
            friends: { where: { status: 'accepted' } },
            clubMembers: true,
          },
        },
        clubMembers: {
          take: 5,
          orderBy: { joinedAt: 'desc' },
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
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        clubMembers: user.clubMembers.map((member) => ({
          id: member.id,
          role: member.role,
          joinedAt: member.joinedAt.toISOString(),
          club: member.club,
        })),
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
