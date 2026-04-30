import StaticContentPage from '@/components/StaticContentPage';

const sections = [
  {
    title: '我们收集的信息',
    content: [
      '为了支持注册、登录、下单和支付，平台会处理昵称、邮箱、订单信息和必要的支付相关数据。',
      '在你使用聊天、订单管理和个人中心功能时，系统还会记录必要的操作日志，用于排查问题和保障安全。',
    ],
  },
  {
    title: '信息的使用方式',
    content: [
      '收集的信息主要用于账号识别、订单履约、客户支持、风险控制和功能优化。',
      '除法律法规要求或获得你的明确授权外，我们不会将你的个人信息用于与平台无关的用途。',
    ],
  },
  {
    title: '数据安全',
    content: [
      '平台会采取合理的技术和管理措施保护账号和交易数据，密码会经过加密存储后再落库。',
      '如果你发现账号异常、疑似泄露或权限问题，请尽快通过联系页面反馈，我们会及时处理。',
    ],
  },
];

export default function PrivacyPage() {
  return <StaticContentPage title="隐私政策" description="以下内容说明平台如何处理和保护你的个人信息。" sections={sections} />;
}
