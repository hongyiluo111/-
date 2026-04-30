import AlipaySdk from 'alipay-sdk';
import Pay from 'wechatpay-node-v3';

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

if (alipayConfig.privateKey) {
  alipaySdk = new AlipaySdk({
    appId: alipayConfig.appId,
    privateKey: alipayConfig.privateKey,
    alipayPublicKey: alipayConfig.alipayPublicKey,
    gateway: alipayConfig.gateway,
    signType: 'RSA2',
  }) as unknown as AlipayClient;
}

if (wechatConfig.privateKey) {
  wechatPay = new Pay({
    appid: wechatConfig.appid,
    mchid: wechatConfig.mchid,
    publicKey: wechatConfig.publicKey,
    privateKey: wechatConfig.privateKey,
  }) as unknown as WechatClient;
}

function generateOrderNo() {
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

async function createAlipayOrder(amount: number, userId: string) {
  if (!alipaySdk) {
    return `https://openapi-sandbox.dl.alipaydev.com/gateway.do?amount=${amount}`;
  }

  const orderNo = generateOrderNo();
  const totalAmount = (amount / 100).toFixed(2);

  return alipaySdk.exec('alipay.trade.page.pay', {
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
}

async function createWechatOrder(amount: number, userId: string): Promise<{ pay_url: string }> {
  if (!wechatPay) {
    return {
      pay_url: `https://wx.tenpay.com/?amount=${amount}`,
    };
  }

  const orderNo = generateOrderNo();
  const totalAmount = amount * 100;

  const result = await wechatPay.transactions_jsapi({
    description: `电竞陪玩平台充值-${amount}元`,
    out_trade_no: orderNo,
    notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/notify`,
    amount: {
      total: totalAmount,
    },
    payer: {
      // This is a demo OpenID fallback for development.
      openid: process.env.WECHAT_TEST_OPENID || 'oUpF8uMuAJO_M2pxb1Q9zNjWeS6o',
    },
  });

  return {
    pay_url: result.pay_url || result.h5_url || result.code_url || `https://wx.tenpay.com/?amount=${amount}&uid=${userId}`,
  };
}

export { createAlipayOrder, createWechatOrder, generateOrderNo };
