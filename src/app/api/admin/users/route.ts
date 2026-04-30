import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return { error: NextResponse.json({ error: '未登录' }, { status: 401 }) };
  }

  const user = verifyToken(token);
  if (!user || user.role !== 'admin') {
    return { error: NextResponse.json({ error: '无权限' }, { status: 403 }) };
  }

  return { user };
}

export async function GET(request: NextRequest) {
  const auth = getAdminFromRequest(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      users: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}
