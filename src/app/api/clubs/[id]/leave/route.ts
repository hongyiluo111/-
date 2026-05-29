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

    if (club.ownerId === userId) {
      return NextResponse.json({ error: '俱乐部创建者不能退出' }, { status: 403 });
    }

    const member = await prisma.clubMember.findFirst({
      where: { clubId: id, userId },
    });

    if (!member) {
      return NextResponse.json({ error: '不是俱乐部成员' }, { status: 404 });
    }

    await prisma.clubMember.delete({
      where: { id: member.id },
    });

    await prisma.club.update({
      where: { id },
      data: { memberCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('退出俱乐部失败:', error);
    return NextResponse.json({ error: '退出失败' }, { status: 500 });
  }
}
