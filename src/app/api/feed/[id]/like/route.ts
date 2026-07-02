export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, likes: true },
    });

    if (!post) {
      return NextResponse.json({ error: '动态不存在' }, { status: 404 });
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      await prisma.$transaction([
        prisma.postLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.post.update({
          where: { id },
          data: { likes: { decrement: 1 } },
        }),
      ]);

      const updatedPost = await prisma.post.findUnique({
        where: { id },
        select: { likes: true },
      });

      return NextResponse.json({
        liked: false,
        likes: updatedPost!.likes,
      });
    } else {
      await prisma.$transaction([
        prisma.postLike.create({
          data: {
            postId: id,
            userId,
          },
        }),
        prisma.post.update({
          where: { id },
          data: { likes: { increment: 1 } },
        }),
      ]);

      const updatedPost = await prisma.post.findUnique({
        where: { id },
        select: { likes: true },
      });

      return NextResponse.json({
        liked: true,
        likes: updatedPost!.likes,
      });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    return NextResponse.json({ error: '点赞操作失败' }, { status: 500 });
  }
}
