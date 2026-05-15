import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId') || searchParams.get('receiverId');
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    if (!partnerId) {
      return NextResponse.json({ error: '缺少 partnerId' }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: decoded.userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: decoded.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    if (messages.length > limit) {
      nextCursor = messages[limit - 1].id;
      messages.pop();
    }

    return NextResponse.json({
      messages: messages.reverse().map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        type: msg.type,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        duration: msg.duration,
        revoked: msg.revoked,
        read: msg.read,
        timestamp: msg.createdAt.getTime(),
      })),
      nextCursor,
    });
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    return NextResponse.json({ error: '获取聊天记录失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiverId, content, type = 'text', fileUrl, fileName, fileSize, duration } = body;
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    if (!receiverId || !content) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const { allowed, retryAfter } = rateLimit(`chat-send:${decoded.userId}`, 30, 60000);
    if (!allowed) {
      return NextResponse.json({ error: `发送太频繁，请在 ${retryAfter} 秒后重试` }, { status: 429 });
    }

    const validTypes = ['text', 'image', 'file', 'voice'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: '无效的消息类型' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: decoded.userId,
        receiverId,
        content,
        type,
        ...(fileUrl ? { fileUrl } : {}),
        ...(fileName ? { fileName } : {}),
        ...(fileSize ? { fileSize } : {}),
        ...(duration ? { duration } : {}),
      },
    });

    const messageData = {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      type: message.type,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      duration: message.duration,
      revoked: message.revoked,
      read: message.read,
      timestamp: message.createdAt.getTime(),
    };

    try {
      const { pusherServer } = await import('@/lib/pusher-server');
      const channelName = `chat-${[decoded.userId, receiverId].sort().join('-')}`;
      await pusherServer.trigger(channelName, 'new-message', messageData);
    } catch {
      console.error('Pusher 推送失败，消息已保存');
    }

    return NextResponse.json({ message: messageData });
  } catch (error) {
    console.error('发送消息失败:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}
