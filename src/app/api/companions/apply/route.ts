import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

interface ApplyBody {
  name?: string;
  game?: string;
  rank?: string;
  price?: number;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '请先登录后再申请' }, { status: 401 });
    }

    const body = (await request.json()) as ApplyBody;
    const name = body.name?.trim();
    const game = body.game?.trim();
    const rank = body.rank?.trim();
    const price = Number(body.price);
    const description = body.description?.trim() || null;

    if (!name || !game || !rank || Number.isNaN(price) || price <= 0) {
      return NextResponse.json({ error: '参数不完整或不合法' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });
    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: '账号状态异常，无法申请' }, { status: 400 });
    }

    const duplicated = await prisma.companion.findFirst({
      where: {
        userId,
        game,
        rank,
        status: { in: ['pending', 'active'] },
      },
      select: { id: true },
    });
    if (duplicated) {
      return NextResponse.json({ error: '你已有同游戏同段位的申请/上架记录' }, { status: 409 });
    }

    const companion = await prisma.companion.create({
      data: {
        userId,
        name,
        game,
        rank,
        price,
        description,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      companion: {
        ...companion,
        price: Number(companion.price),
        createdAt: companion.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Apply companion failed:', error);
    return NextResponse.json({ error: '申请提交失败' }, { status: 500 });
  }
}
