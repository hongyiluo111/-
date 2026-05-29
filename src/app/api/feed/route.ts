import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const game = searchParams.get('game');

    const where: Record<string, unknown> = {};
    if (game) {
      where.game = game;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map((post) => ({
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
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取动态列表失败:', error);
    return NextResponse.json({ error: '获取动态列表失败' }, { status: 500 });
  }
}
