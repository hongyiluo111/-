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

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        companionId: String(companionId),
        companionName: companionName.trim(),
        companionRank: (rank || '').trim(),
        companionAvatar: companionAvatar?.trim() || '',
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
