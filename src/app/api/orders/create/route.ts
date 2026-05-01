import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

interface CreateOrderBody {
  companionId?: string | number;
  companionName?: string;
  companionAvatar?: string;
  game?: string;
  rank?: string;
  price?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const { companionId, companionName, companionAvatar, game, rank, price } = body;

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录状态无效，请重新登录' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    if (!companionId || !companionName || !game || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ error: '参数不完整或不合法' }, { status: 400 });
    }

    // 验证陪玩是否存在且状态为 active
    const companion = await prisma.companion.findUnique({
      where: { id: String(companionId) },
      select: { id: true, status: true, price: true, name: true, rank: true, avatar: true },
    });

    if (!companion) {
      return NextResponse.json({ error: '陪玩不存在' }, { status: 404 });
    }

    if (companion.status !== 'active') {
      return NextResponse.json({ error: '陪玩当前不可用' }, { status: 400 });
    }

    // 验证价格是否匹配
    if (Number(companion.price) !== price) {
      return NextResponse.json({ error: '价格不匹配，请刷新页面重试' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        companionId: companion.id,
        companionName: companion.name,
        companionRank: companion.rank,
        companionAvatar: companion.avatar || '',
        game: game.trim(),
        price,
        status: 'pending',
        paymentStatus: 'unpaid',
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        companionId: order.companionId,
        companionName: order.companionName,
        companionAvatar: order.companionAvatar,
        game: order.game,
        price: Number(order.price),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}
