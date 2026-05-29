import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: '俱乐部不存在' }, { status: 404 });
    }

    return NextResponse.json({ club });
  } catch (error) {
    console.error('获取俱乐部信息失败:', error);
    return NextResponse.json({ error: '获取俱乐部信息失败' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;

    const club = await prisma.club.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!club) {
      return NextResponse.json({ error: '俱乐部不存在' }, { status: 404 });
    }

    if (club.ownerId !== userId) {
      return NextResponse.json({ error: '无权限修改此俱乐部' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, avatar, banner, gameId } = body as {
      name?: string;
      description?: string;
      avatar?: string;
      banner?: string;
      gameId?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar?.trim() || null;
    if (banner !== undefined) updateData.banner = banner?.trim() || null;
    if (gameId !== undefined) updateData.gameId = gameId?.trim() || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '缺少更新参数' }, { status: 400 });
    }

    const updated = await prisma.club.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ club: updated });
  } catch (error) {
    console.error('更新俱乐部失败:', error);
    return NextResponse.json({ error: '更新俱乐部失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;

    const club = await prisma.club.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!club) {
      return NextResponse.json({ error: '俱乐部不存在' }, { status: 404 });
    }

    if (club.ownerId !== userId) {
      return NextResponse.json({ error: '无权限删除此俱乐部' }, { status: 403 });
    }

    await prisma.club.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除俱乐部失败:', error);
    return NextResponse.json({ error: '删除俱乐部失败' }, { status: 500 });
  }
}
