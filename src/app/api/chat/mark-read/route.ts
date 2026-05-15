import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const { partnerId } = await request.json();
    if (!partnerId) {
      return NextResponse.json({ error: '缺少 partnerId' }, { status: 400 });
    }

    const result = await prisma.chatMessage.updateMany({
      where: {
        senderId: partnerId,
        receiverId: decoded.userId,
        read: false,
        revoked: false,
      },
      data: { read: true },
    });

    if (result.count > 0) {
      try {
        const { pusherServer } = await import('@/lib/pusher-server');
        const channelName = `chat-${[decoded.userId, partnerId].sort().join('-')}`;
        await pusherServer.trigger(channelName, 'messages-read', { readerId: decoded.userId });
      } catch {
        console.error('Pusher 已读通知失败');
      }
    }

    return NextResponse.json({ success: true, markedCount: result.count });
  } catch (error) {
    console.error('标记已读失败:', error);
    return NextResponse.json({ error: '标记已读失败' }, { status: 500 });
  }
}
