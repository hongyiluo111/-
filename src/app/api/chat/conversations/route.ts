export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

function getLastMessagePreview(msg: { content: string; type: string; revoked: boolean }): string {
  if (msg.revoked) return '[消息已撤回]';
  switch (msg.type) {
    case 'image': return '[图片]';
    case 'file': return `[文件] ${msg.content}`;
    case 'voice': return '[语音消息]';
    default: return msg.content;
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    const userId = decoded.userId;

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const conversations: Record<string, {
      userId: string;
      userName: string;
      lastMessage: string;
      lastTime: Date;
      unread: number;
    }> = {};

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          userId: partnerId,
          userName: '',
          lastMessage: getLastMessagePreview(msg),
          lastTime: msg.createdAt,
          unread: 0,
        };
      }
      if (msg.receiverId === userId && !msg.read && !msg.revoked) {
        conversations[partnerId].unread += 1;
      }
    }

    const userIds = Object.keys(conversations);
    if (userIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
      });
      for (const u of users) {
        if (conversations[u.id]) {
          conversations[u.id].userName = u.name;
        }
      }
    }

    return NextResponse.json({
      conversations: Object.values(conversations).sort(
        (a, b) => b.lastTime.getTime() - a.lastTime.getTime()
      ),
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json({ conversations: [] });
  }
}
