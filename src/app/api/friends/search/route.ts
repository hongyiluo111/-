export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    const email = request.nextUrl.searchParams.get('email');
    if (!email) return NextResponse.json({ error: '缺少 email' }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (!user || user.id === decoded.userId) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: { id: user.id, name: user.name } });
  } catch {
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
