import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

const REVOKE_TIME_LIMIT = 2 * 60 * 1000;

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

    const { allowed, retryAfter } = rateLimit(`chat-revoke:${decoded.userId}`, 20, 60000);
    if (!allowed) {
      return NextResponse.json({ error: `操作太频繁，请在 ${retryAfter} 秒后重试` }, { status: 429 });
    }

    const { messageId } = await request.json();
    if (!messageId) {
      return NextResponse.json({ error: '缺少消息ID' }, { status: 400 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: '消息不存在' }, { status: 404 });
    }

    if (message.senderId !== decoded.userId) {
      return NextResponse.json({ error: '只能撤回自己发送的消息' }, { status: 403 });
    }

    if (message.revoked) {
      return NextResponse.json({ error: '消息已撤回' }, { status: 400 });
    }

    const timeDiff = Date.now() - message.createdAt.getTime();
    if (timeDiff > REVOKE_TIME_LIMIT) {
      return NextResponse.json({ error: '超过2分钟，无法撤回' }, { status: 400 });
    }

    await prisma.chatMessage.update({
      where: { id: messageId },
      data: { revoked: true },
    });

    try {
      const { pusherServer } = await import('@/lib/pusher-server');
      const channelName = `chat-${[message.senderId, message.receiverId].sort().join('-')}`;
      await pusherServer.trigger(channelName, 'message-revoked', { messageId });
    } catch {
      console.error('Pusher 撤回通知失败');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('消息撤回失败:', error);
    return NextResponse.json({ error: '撤回失败' }, { status: 500 });
  }
}
