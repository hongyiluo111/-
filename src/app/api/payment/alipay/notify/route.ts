export const dynamic = 'force-dynamic';

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
      const totalAmount = Number(data.total_amount);

      console.log('Alipay payment successful:', { orderNo, totalAmount });

      // 查询充值订单
      const recharge = await prisma.rechargeOrder.findUnique({
        where: { paymentId: orderNo },
        select: { id: true, userId: true, amount: true, diamonds: true, status: true },
      });

      if (recharge) {
        // 幂等：已支付直接返回 success
        if (recharge.status === 'paid') {
          return NextResponse.json({ code: 'success', message: 'already paid' });
        }

        // 校验金额（支付宝 total_amount 单位为元）
        const expectedAmount = Number(recharge.amount);
        if (Math.abs(totalAmount - expectedAmount) > 0.01) {
          console.error('支付宝回调金额不匹配:', { expected: expectedAmount, actual: totalAmount, orderNo });
          return NextResponse.json({ code: 'fail', message: 'Amount mismatch' });
        }

        // 事务：更新充值订单状态 + 发放钻石
        await prisma.$transaction([
          prisma.rechargeOrder.update({
            where: { id: recharge.id },
            data: {
              status: 'paid',
              paidAt: new Date(),
            },
          }),
          prisma.user.update({
            where: { id: recharge.userId },
            data: {
              diamonds: { increment: recharge.diamonds },
            },
          }),
        ]);

        console.log('充值成功，已发放钻石:', { userId: recharge.userId, diamonds: recharge.diamonds });
      }
    }

    return NextResponse.json({ code: 'success', message: 'success' });
  } catch (error) {
    console.error('Alipay notify error:', error);
    return NextResponse.json({ code: 'fail', message: 'Internal error' });
  }
}
