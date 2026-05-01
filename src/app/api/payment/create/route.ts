import { createAlipayOrder, createWechatOrder } from '@/lib/payment';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 10000;

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '登录已过期' }, { status: 401 });
    }

    const { amount, method } = await request.json();
    const userId = decoded.userId;

    if (!amount || !method) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 校验金额
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      return NextResponse.json({ error: '金额格式不正确' }, { status: 400 });
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `金额必须在 ${MIN_AMOUNT} 到 ${MAX_AMOUNT} 之间` },
        { status: 400 }
      );
    }

    // 保留两位小数
    const normalizedAmount = Math.round(amount * 100) / 100;

    let result: { paymentUrl: string; paymentId: string };

    if (method === 'alipay') {
      result = await createAlipayOrder(normalizedAmount, userId);
    } else if (method === 'wechat') {
      result = await createWechatOrder(normalizedAmount, userId);
    } else {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    return NextResponse.json({ paymentUrl: result.paymentUrl, paymentId: result.paymentId });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}