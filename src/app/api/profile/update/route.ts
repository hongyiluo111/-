import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

function getUserIdFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded?.userId) {
    return null;
  }

  return decoded.userId;
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: '昵称不能为空' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Update profile failed:', error);
    return NextResponse.json({ error: '更新资料失败' }, { status: 500 });
  }
}
