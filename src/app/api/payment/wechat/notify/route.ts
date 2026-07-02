export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const wechatConfig = {
  appid: process.env.WECHAT_APPID || '',
  mchid: process.env.WECHAT_MCHID || '',
  apiKey: process.env.WECHAT_API_KEY || '',
};

function verifyWechatSign(params: Record<string, string>): boolean {
  if (!wechatConfig.apiKey) {
    console.error('WECHAT_API_KEY 未配置，无法验证签名');
    return false;
  }

  const { sign, ...rest } = params;
  const sortedKeys = Object.keys(rest).sort();
  const stringA = sortedKeys.map((key) => `${key}=${rest[key]}`).join('&');
  const stringSignTemp = `${stringA}&key=${wechatConfig.apiKey}`;
  const calculatedSign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  return calculatedSign === sign;
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    console.log('微信支付回调原始数据:', text);

    const params: Record<string, string> = {};
    const matches = text.matchAll(/<(\w+)><!\[CDATA\[([^\]]*)\]\]><\/\1>/g);
    for (const m of matches) {
      params[m[1]] = m[2];
    }
    if (Object.keys(params).length === 0) {
      const plainMatches = text.matchAll(/<(\w+)>([^<]*)<\/\1>/g);
      for (const m of plainMatches) {
        params[m[1]] = m[2];
      }
    }

    if (params.return_code !== 'SUCCESS') {
      return new NextResponse(
        '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    if (!verifyWechatSign(params)) {
      console.error('微信支付回调签名验证失败');
      return new NextResponse(
        '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名错误]]></return_msg></xml>',
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    if (params.result_code === 'SUCCESS') {
      const orderNo = params.out_trade_no;
      if (orderNo) {
        const recharge = await prisma.rechargeOrder.findUnique({
          where: { paymentId: orderNo },
          select: { id: true, userId: true, amount: true, diamonds: true, status: true },
        });

        if (recharge) {
          // 幂等：已支付直接返回 success
          if (recharge.status === 'paid') {
            return new NextResponse(
              '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
              { headers: { 'Content-Type': 'application/xml' } }
            );
          }

          // 验证金额（微信金额单位为分）
          const totalFee = Number(params.total_fee);
          const expectedFee = Math.round(Number(recharge.amount) * 100);
          if (totalFee !== expectedFee) {
            console.error('微信支付回调金额不匹配:', { expected: expectedFee, actual: totalFee });
            return new NextResponse(
              '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[金额错误]]></return_msg></xml>',
              { headers: { 'Content-Type': 'application/xml' } }
            );
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

          console.log('微信充值成功，已发放钻石:', { userId: recharge.userId, diamonds: recharge.diamonds });
        }
      }
    }

    return new NextResponse(
      '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
      { headers: { 'Content-Type': 'application/xml' } }
    );
  } catch (error) {
    console.error('微信支付回调失败:', error);
    return new NextResponse(
      '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Error]]></return_msg></xml>',
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }
}
