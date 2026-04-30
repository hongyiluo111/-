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

export async function PATCH(request: NextRequest) {
  const auth = getAdminFromRequest(request);
  if ('error' in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const { userId, status } = body as { userId?: string; status?: 'active' | 'banned' };

    if (!userId || !status) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (!['active', 'banned'].includes(status)) {
      return NextResponse.json({ error: '状态不合法' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    if (target.role === 'admin') {
      return NextResponse.json({ error: '不能封禁管理员账号' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    return NextResponse.json({ error: '更新用户状态失败' }, { status: 500 });
  }
}
