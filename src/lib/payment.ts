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
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
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

async function createWechatOrder(amount: number, userId: string): Promise<PaymentResult> {
  const orderNo = generateOrderNo();

  if (!wechatPay) {
    return {
      paymentId: orderNo,
      paymentUrl: `https://wx.tenpay.com/?amount=${amount}`,
    };
  }

  const totalAmount = amount * 100;

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

  return {
    paymentId: orderNo,
    paymentUrl: result.pay_url || result.h5_url || result.code_url || `https://wx.tenpay.com/?amount=${amount}&uid=${userId}`,
  };
}

export { createAlipayOrder, createWechatOrder, generateOrderNo };
