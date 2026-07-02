export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    await prisma.user.delete({ where: { id: decoded.userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '注销失败' }, { status: 500 });
  }
}
