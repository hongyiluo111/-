import { NextRequest, NextResponse } from 'next/server';
import AlipaySdk from 'alipay-sdk';

// 支付宝配置
const alipayConfig = {
  appId: '9021000162692275', // 沙箱AppID
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || ''
};

const alipaySdk = new AlipaySdk({
  appId: alipayConfig.appId,
  privateKey: alipayConfig.privateKey,
  alipayPublicKey: alipayConfig.alipayPublicKey
});

export async function POST(request: NextRequest) {
  try {
    // 解析支付宝回调数据
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // 验证签名
    const verifyResult = alipaySdk.checkNotifySign(data);
    if (!verifyResult) {
      return NextResponse.json({ code: 'fail', message: 'Invalid signature' });
    }

    // 处理支付成功逻辑
    const tradeStatus = data.trade_status as string;
    if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
      const orderNo = data.out_trade_no as string;
      const amount = parseFloat(data.total_amount as string) * 100; // 转换为分

      // 这里应该更新订单状态和用户钻石余额
      // 例如：await updateOrderStatus(orderNo, 'completed');
      // 例如：await addUserDiamonds(userId, amount * 10); // 1元=10钻石

      console.log('Alipay payment successful:', { orderNo, amount });
    }

    // 返回成功响应给支付宝
    return NextResponse.json({ code: 'success', message: 'success' });
  } catch (error) {
    console.error('Alipay notify error:', error);
    return NextResponse.json({ code: 'fail', message: 'Internal error' });
  }
}