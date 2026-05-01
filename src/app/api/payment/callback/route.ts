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
    console.warn('WECHAT_API_KEY 未配置，跳过签名验证');
    return true;
  }

  const { sign, ...rest } = params;
  const sortedKeys = Object.keys(rest).sort();
  const stringA = sortedKeys.map((key) => `${key}=${rest[key]}`).join('&');
  const stringSignTemp = `${stringA}&key=${wechatConfig.apiKey}`;
  const calculatedSign = crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  return calculatedSign === sign;
}

// 微信支付回调 - 微信发送 XML 格式数据
async function handleWechatCallback(request: NextRequest) {
  try {
    const text = await request.text();
    console.log('微信支付回调原始数据:', text);

    // 简单 XML 解析
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

    console.log('微信支付回调解析:', params);

    if (params.return_code !== 'SUCCESS') {
      return new NextResponse(
        '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>',
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    // 验证签名
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
        const order = await prisma.order.findFirst({
          where: { paymentId: orderNo },
          select: { id: true, price: true },
        });

        if (order) {
          // 验证金额（微信金额单位为分）
          const totalFee = Number(params.total_fee);
          const expectedFee = Math.round(Number(order.price) * 100);
          if (totalFee !== expectedFee) {
            console.error('微信支付回调金额不匹配:', { expected: expectedFee, actual: totalFee });
            return new NextResponse(
              '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[金额错误]]></return_msg></xml>',
              { headers: { 'Content-Type': 'application/xml' } }
            );
          }

          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'paid',
              paymentMethod: 'wechat',
            },
          });
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

// 支付宝回调
async function handleAlipayCallback(request: NextRequest) {
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    console.log('支付宝回调:', data);

    const tradeStatus = data.trade_status;
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      const orderNo = data.out_trade_no;
      if (orderNo) {
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
    }

    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('支付宝回调失败:', error);
    return new NextResponse('fail', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);

  if (url.pathname.includes('/wechat')) {
    return handleWechatCallback(request);
  }
  return handleAlipayCallback(request);
}
