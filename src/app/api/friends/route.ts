import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: decoded.userId, status: 'accepted' },
          { friendId: decoded.userId, status: 'accepted' },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        friend: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingRequests = await prisma.friend.findMany({
      where: { friendId: decoded.userId, status: 'pending' },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      friends: friends.map((f) => ({
        id: f.id,
        userId: f.userId === decoded.userId ? f.friendId : f.userId,
        name: f.userId === decoded.userId ? f.friend.name : f.user.name,
      })),
      requests: pendingRequests.map((r) => ({
        id: r.id,
        userId: r.userId,
        name: r.user.name,
      })),
    });
  } catch (error) {
    console.error('获取好友列表失败:', error);
    return NextResponse.json({ friends: [], requests: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    const { friendId } = await request.json();
    if (!friendId) return NextResponse.json({ error: '缺少 friendId' }, { status: 400 });

    if (friendId === decoded.userId) {
      return NextResponse.json({ error: '不能添加自己为好友' }, { status: 400 });
    }

    const existing = await prisma.friend.findUnique({
      where: { userId_friendId: { userId: decoded.userId, friendId } },
    });
    if (existing) return NextResponse.json({ error: '已发送过好友请求' }, { status: 400 });

    await prisma.friend.create({
      data: { userId: decoded.userId, friendId, status: 'pending' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('添加好友失败:', error);
    return NextResponse.json({ error: '添加好友失败' }, { status: 500 });
  }
}
