import Pay from 'wechatpay-node-v3';
import { randomBytes } from 'crypto';

type AlipayClient = {
  exec: (
    api: string,
    options: {
      method: 'GET' | 'POST';
      params: Record<string, unknown>;
      returnUrl?: string;
      notifyUrl?: string;
    }
  ) => Promise<string>;
};

type WechatOrderPayload = {
  description: string;
  out_trade_no: string;
  notify_url: string;
  amount: {
    total: number;
  };
  payer: {
    openid: string;
  };
};

type WechatOrderResult = {
  pay_url?: string;
  h5_url?: string;
  code_url?: string;
};

type WechatClient = {
  transactions_jsapi: (payload: WechatOrderPayload) => Promise<WechatOrderResult>;
};

const alipayConfig = {
  appId: process.env.ALIPAY_APP_ID || '9021000162692275',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  gateway: process.env.ALIPAY_GATEWAY || 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',
};

const wechatConfig = {
  appid: process.env.WECHAT_APPID || '',
  mchid: process.env.WECHAT_MCHID || '',
  publicKey: process.env.WECHAT_PUBLIC_KEY || '',
  privateKey: process.env.WECHAT_PRIVATE_KEY || '',
};

let alipaySdk: AlipayClient | null = null;
let wechatPay: WechatClient | null = null;

async function initAlipaySdk() {
  if (alipaySdk) return alipaySdk;
  if (!alipayConfig.privateKey) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AlipaySdk = (await import('alipay-sdk')).default as any;
  alipaySdk = new AlipaySdk({
    appId: alipayConfig.appId,
    privateKey: alipayConfig.privateKey,
    alipayPublicKey: alipayConfig.alipayPublicKey,
    gateway: alipayConfig.gateway,
    signType: 'RSA2',
  }) as unknown as AlipayClient;
  return alipaySdk;
}

if (wechatConfig.privateKey) {
  wechatPay = new Pay({
    appid: wechatConfig.appid,
    mchid: wechatConfig.mchid,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publicKey: Buffer.from(wechatConfig.publicKey) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    privateKey: Buffer.from(wechatConfig.privateKey) as any,
  }) as unknown as WechatClient;
}

function generateOrderNo() {
  // 时间戳(13位) + 16位十六进制随机串(2^64 空间)，高并发下碰撞概率可忽略
  return Date.now().toString() + randomBytes(8).toString('hex');
}

type PaymentResult = { paymentUrl: string; paymentId: string };

async function createAlipayOrder(amount: number, userId: string): Promise<PaymentResult> {
  const sdk = await initAlipaySdk();
  const orderNo = generateOrderNo();

  if (!sdk) {
    return {
      paymentId: orderNo,
      paymentUrl: `https://openapi-sandbox.dl.alipaydev.com/gateway.do?amount=${amount}`,
    };
  }

  const totalAmount = amount.toFixed(2);

  const paymentUrl = await sdk.exec('alipay.trade.page.pay', {
    method: 'GET',
    params: {
      out_trade_no: orderNo,
      total_amount: totalAmount,
      subject: `电竞陪玩平台充值-${amount}元`,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      passback_params: userId,
    },
    returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/profile?payment=success&orderNo=${orderNo}`,
    notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/alipay/notify`,
  });

  return { paymentUrl, paymentId: orderNo };
}

async function createWechatOrder(amount: number, _userId: string): Promise<PaymentResult> {
  const orderNo = generateOrderNo();
  void _userId;

  if (!wechatPay) {
    return {
      paymentId: orderNo,
      paymentUrl: `https://wx.tenpay.com/?amount=${amount}`,
    };
  }

  // 微信金额单位为分，使用 Math.round 避免浮点精度问题（如 19.99 * 100 = 1999.0000000000002）
  const totalAmount = Math.round(amount * 100);

  const result = await wechatPay.transactions_jsapi({
    description: `电竞陪玩平台充值-${amount}元`,
    out_trade_no: orderNo,
    notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/notify`,
    amount: {
      total: totalAmount,
    },
    payer: {
      openid: process.env.WECHAT_TEST_OPENID || 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o',
    },
  });

  const paymentUrl = result.pay_url || result.h5_url || result.code_url;
  if (!paymentUrl) {
    throw new Error('微信下单失败：未返回支付链接');
  }

  return {
    paymentId: orderNo,
    paymentUrl,
  };
}

export { createAlipayOrder, createWechatOrder, generateOrderNo };
