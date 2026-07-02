export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = (await request.json()) as {
      content?: string;
      images?: string[];
      game?: string;
      type?: string;
    };

    const { content, images, game, type } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        userId,
        content: content.trim(),
        images: images || undefined,
        game: game || null,
        type: type || 'text',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        post: {
          id: post.id,
          userId: post.userId,
          content: post.content,
          images: post.images,
          game: post.game,
          type: post.type,
          likes: post.likes,
          comments: post.comments,
          createdAt: post.createdAt.toISOString(),
          userName: post.user.name,
          userAvatar: post.user.avatar,
          userRole: post.user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('发布动态失败:', error);
    return NextResponse.json({ error: '发布动态失败' }, { status: 500 });
  }
}
