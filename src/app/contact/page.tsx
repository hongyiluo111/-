import StaticContentPage from '@/components/StaticContentPage';

const sections = [
  {
    title: '联系方式',
    content: [
      '客服邮箱：contact@hongyi-esports.com',
      '联系电话：123-4567-8910',
      '服务时间：周一至周日 10:00 - 22:00',
    ],
  },
  {
    title: '建议反馈',
    content: [
      '如果你在使用过程中遇到按钮无响应、支付异常、订单状态错误或页面跳转问题，可以通过以上方式联系平台。',
      '反馈时建议附上账号邮箱、问题页面、复现步骤和截图，这样能更快定位问题。',
    ],
  },
  {
    title: '合作与商务',
    content: [
      '陪玩师入驻、品牌合作和渠道接入，也可以通过客服邮箱发起联系。',
      '邮件标题建议注明需求类型，便于平台快速分发给对应负责人。',
    ],
  },
];

export default function ContactPage() {
  return <StaticContentPage title="联系我们" description="遇到问题或合作需求时，可通过以下方式联系平台。" sections={sections} />;
}
