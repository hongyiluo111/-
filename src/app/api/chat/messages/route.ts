import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const receiverId = searchParams.get('receiverId');
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

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: decoded.userId, receiverId },
          { senderId: receiverId, receiverId: decoded.userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      messages: messages.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        timestamp: msg.createdAt.getTime(),
      })),
    });
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    return NextResponse.json({ error: '获取聊天记录失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiverId, content } = body;
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

    const message = await prisma.chatMessage.create({
      data: {
        senderId: decoded.userId,
        receiverId,
        content,
      },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.createdAt.getTime(),
      },
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}
