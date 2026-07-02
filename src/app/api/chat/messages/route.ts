export const dynamic = 'force-dynamic';

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

    if (!receiverId) {
      return NextResponse.json({ error: '缺少 receiverId' }, { status: 400 });
    }

    // 不允许给自己发消息
    if (receiverId === decoded.userId) {
      return NextResponse.json({ error: '不能给自己发消息' }, { status: 400 });
    }

    // 按消息类型差异化校验必填字段
    // - text: 必填 content
    // - image/file/voice: 必填 fileUrl（content 可空）
    const validTypes = ['text', 'image', 'file', 'voice'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: '无效的消息类型' }, { status: 400 });
    }
    if (type === 'text' && !content) {
      return NextResponse.json({ error: '文本消息不能为空' }, { status: 400 });
    }
    if (type !== 'text' && !fileUrl) {
      return NextResponse.json({ error: `${type} 类型消息必须提供 fileUrl` }, { status: 400 });
    }

    // 校验接收方存在且未软删除
    const receiver = await prisma.user.findFirst({
      where: { id: receiverId, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!receiver) {
      return NextResponse.json({ error: '接收方不存在' }, { status: 404 });
    }

    const { allowed, retryAfter } = rateLimit(`chat-send:${decoded.userId}`, 30, 60000);
    if (!allowed) {
      return NextResponse.json({ error: `发送太频繁，请在 ${retryAfter} 秒后重试` }, { status: 429 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: decoded.userId,
        receiverId,
        content: content || null,
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
      const { getPusherServer } = await import('@/lib/pusher-server');
      const channelName = `chat-${[decoded.userId, receiverId].sort().join('-')}`;
      await getPusherServer().trigger(channelName, 'new-message', messageData);
    } catch {
      console.error('Pusher 推送失败，消息已保存');
    }

    return NextResponse.json({ message: messageData });
  } catch (error) {
    console.error('发送消息失败:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}
