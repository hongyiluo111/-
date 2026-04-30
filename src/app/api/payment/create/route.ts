import { createAlipayOrder, createWechatOrder } from '@/lib/payment';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, method, userId } = await request.json();

    if (!amount || !method || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let paymentUrl;

    if (method === 'alipay') {
      paymentUrl = await createAlipayOrder(amount, userId);
    } else if (method === 'wechat') {
      const result = await createWechatOrder(amount, userId);
      paymentUrl = result.pay_url;
    } else {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    return NextResponse.json({ paymentUrl });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}