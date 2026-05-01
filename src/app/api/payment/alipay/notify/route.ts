import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const alipayConfig = {
  appId: process.env.ALIPAY_APP_ID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || ''
};

async function getAlipaySdk() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AlipaySdk = (await import('alipay-sdk')).default as any;
  return new AlipaySdk({
    appId: alipayConfig.appId,
    privateKey: alipayConfig.privateKey,
    alipayPublicKey: alipayConfig.alipayPublicKey
  });
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const data: Record<string, string> = {};
    params.forEach((value, key) => { data[key] = value; });

    const alipaySdk = await getAlipaySdk();
    const verifyResult = alipaySdk.checkNotifySign(data);
    if (!verifyResult) {
      return NextResponse.json({ code: 'fail', message: 'Invalid signature' });
    }

    const tradeStatus = data.trade_status;
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      const orderNo = data.out_trade_no;
      const totalAmount = data.total_amount;

      console.log('Alipay payment successful:', { orderNo, totalAmount });

      const order = await prisma.order.findFirst({
        where: { paymentId: orderNo },
        select: { id: true },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'paid',
            paymentMethod: 'alipay',
          },
        });
      }
    }

    return NextResponse.json({ code: 'success', message: 'success' });
  } catch (error) {
    console.error('Alipay notify error:', error);
    return NextResponse.json({ code: 'fail', message: 'Internal error' });
  }
}
