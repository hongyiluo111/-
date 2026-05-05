import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: '未登录' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: '登录已过期' }, { status: 401 });

    // 获取所有相关消息
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: decoded.userId },
          { receiverId: decoded.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    // 按对话分组
    const conversations: Record<string, {
      userId: string;
      userName: string;
      lastMessage: string;
      lastTime: Date;
      unread: number;
    }> = {};

    for (const msg of messages) {
      const partnerId = msg.senderId === decoded.userId ? msg.receiverId : msg.senderId;
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          userId: partnerId,
          userName: '',
          lastMessage: msg.content,
          lastTime: msg.createdAt,
          unread: 0,
        };
      }
      if (msg.receiverId === decoded.userId) {
        conversations[partnerId].unread += 1;
      }
    }

    // 获取用户名称
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
