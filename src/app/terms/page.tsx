import StaticContentPage from '@/components/StaticContentPage';

const sections = [
  {
    title: '服务范围',
    content: [
      '平台提供电竞陪玩信息展示、筛选、咨询、下单和订单管理功能。陪玩服务内容以订单页面展示的信息为准。',
      '用户在下单前应确认游戏、段位、价格和时长等关键信息，避免因理解偏差产生争议。',
    ],
  },
  {
    title: '用户义务',
    content: [
      '用户应保证注册信息真实有效，不得冒用他人身份或使用非法支付手段。',
      '在聊天、下单和履约过程中，禁止发布违法违规、骚扰辱骂或引流私单内容。',
    ],
  },
  {
    title: '订单与退款',
    content: [
      '订单创建后将进入相应状态流转。平台会根据订单状态支持取消、完成或售后处理。',
      '涉及退款时，将结合支付状态、履约情况和争议证据进行审核，最终以平台处理结果为准。',
    ],
  },
];

export default function TermsPage() {
  return <StaticContentPage title="服务条款" description="使用平台前，请先阅读并理解以下条款。" sections={sections} />;
}
