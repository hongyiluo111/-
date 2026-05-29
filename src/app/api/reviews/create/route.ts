import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = (await request.json()) as {
      orderId?: string;
      rating?: number;
      content?: string;
    };

    const { orderId, rating, content } = body;

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: '参数不完整或评分不合法' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: { id: true, status: true, companionId: true },
    });

    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    if (order.status !== 'completed') {
      return NextResponse.json({ error: '只能评价已完成的订单' }, { status: 400 });
    }

    const existingReview = await prisma.review.findFirst({
      where: { orderId },
      select: { id: true },
    });

    if (existingReview) {
      return NextResponse.json({ error: '该订单已评价' }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          orderId,
          userId,
          companionId: order.companionId,
          rating,
          content: content?.trim() || null,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { rating, review: content?.trim() || null, reviewedAt: new Date() },
      });

      const companion = await tx.companion.findUnique({
        where: { id: order.companionId },
        select: { rating: true, ratingCount: true },
      });

      if (companion) {
        const newCount = companion.ratingCount + 1;
        const newRating = (companion.rating * companion.ratingCount + rating) / newCount;
        await tx.companion.update({
          where: { id: order.companionId },
          data: {
            rating: Math.round(newRating * 10) / 10,
            ratingCount: newCount,
          },
        });
      }

      return review;
    });

    return NextResponse.json({ success: true, review: result });
  } catch (error) {
    console.error('提交评价失败:', error);
    return NextResponse.json({ error: '提交评价失败' }, { status: 500 });
  }
}
