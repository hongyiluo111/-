import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

type ChatMessageRecord = {
  role: string;
  content: string;
  createdAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companionName = searchParams.get('companionName');
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const where: { userId: string; companionName?: string } = { userId: user.id };
    if (companionName) {
      where.companionName = companionName;
    }

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      messages: (messages as ChatMessageRecord[]).map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt.getTime(),
      })),
    });
  } catch (error) {
    console.error('获取聊天记录失败:', error);
    return NextResponse.json(
      { error: '获取聊天记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companionName, role, content } = body;
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    if (!companionName || !role || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId: user.id,
        companionName,
        role,
        content,
      },
    });

    return NextResponse.json({
      message: {
        role: message.role,
        content: message.content,
        timestamp: message.createdAt.getTime(),
      },
    });
  } catch (error) {
    console.error('保存聊天记录失败:', error);
    return NextResponse.json(
      { error: '保存聊天记录失败' },
      { status: 500 }
    );
  }
}
