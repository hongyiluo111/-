export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const club = await prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      return NextResponse.json({ error: '俱乐部不存在' }, { status: 404 });
    }

    const existingMember = await prisma.clubMember.findFirst({
      where: { clubId: id, userId },
    });

    if (existingMember) {
      return NextResponse.json({ error: '已经是成员' }, { status: 409 });
    }

    // 事务保证成员创建与计数原子性
    await prisma.$transaction([
      prisma.clubMember.create({
        data: {
          clubId: id,
          userId,
          role: 'member',
        },
      }),
      prisma.club.update({
        where: { id },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('加入俱乐部失败:', error);
    return NextResponse.json({ error: '加入失败' }, { status: 500 });
  }
}
