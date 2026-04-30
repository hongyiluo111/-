import StaticContentPage from '@/components/StaticContentPage';

const sections = [
  {
    title: '如何下单',
    content: [
      '进入找陪玩页面后，可以按游戏、段位和价格筛选陪玩师。选择目标后点击“下单陪玩”，填写时长并提交即可生成订单。',
      '下单前请先登录账号。未登录状态下，系统会提示先登录后再继续操作。',
    ],
  },
  {
    title: '如何充值',
    content: [
      '个人中心支持快捷充值。点击金额后可选择支付宝或微信支付，充值成功后钻石余额会增加。',
      '如果支付网关暂时不可用，页面会走演示支付流程，方便你继续测试站内交互。',
    ],
  },
  {
    title: '订单取消与售后',
    content: [
      '待接单、已接单和进行中的订单都支持发起取消，具体以订单状态为准。',
      '如果遇到陪玩师失联、时间冲突或支付异常，请通过联系页面提交问题，我们会尽快处理。',
    ],
  },
];

export default function FAQPage() {
  return <StaticContentPage title="常见问题" description="这里汇总了下单、充值和售后的主要问题。" sections={sections} />;
}
