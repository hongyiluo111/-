import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    const { requestId } = await request.json();
    if (!requestId) return NextResponse.json({ error: '缺少 requestId' }, { status: 400 });

    const friendRequest = await prisma.friend.findFirst({
      where: { id: requestId, friendId: decoded.userId, status: 'pending' },
    });
    if (!friendRequest) return NextResponse.json({ error: '请求不存在' }, { status: 404 });

    await prisma.friend.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('接受好友请求失败:', error);
    return NextResponse.json({ error: '接受失败' }, { status: 500 });
  }
}
