'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 'account-1',
    category: '账号相关',
    question: '如何注册账号？',
    answer: '点击页面右上角"注册"按钮，填写用户名、邮箱和密码即可完成注册。注册后您可以浏览陪玩师列表、下单预约等。',
  },
  {
    id: 'account-2',
    category: '账号相关',
    question: '忘记密码怎么办？',
    answer: '在登录页面点击"忘记密码"，输入注册邮箱，系统会发送密码重置链接到您的邮箱。',
  },
  {
    id: 'account-3',
    category: '账号相关',
    question: '如何修改个人信息？',
    answer: '登录后点击右上角头像，选择"个人设置"，即可修改头像、昵称、个人简介等信息。',
  },
  {
    id: 'account-4',
    category: '账号相关',
    question: '如何注销账号？',
    answer: '请联系客服申请账号注销，我们会在3个工作日内处理您的请求。',
  },
  {
    id: 'order-1',
    category: '下单相关',
    question: '如何预约陪玩？',
    answer: '在"找陪玩"页面选择心仪的陪玩师，点击"预约"按钮，选择游戏和时间段，确认下单即可。',
  },
  {
    id: 'order-2',
    category: '下单相关',
    question: '可以取消订单吗？',
    answer: '在陪玩师确认前可以取消订单。确认后如需取消，请联系客服处理。',
  },
  {
    id: 'order-3',
    category: '下单相关',
    question: '订单完成后如何评价？',
    answer: '订单完成后，您可以在"我的订单"页面找到对应订单，点击"评价"按钮进行评分和评价。',
  },
  {
    id: 'order-4',
    category: '下单相关',
    question: '如何查看订单记录？',
    answer: '登录后在"我的订单"页面可以查看所有历史订单，包括进行中、已完成和已取消的订单。',
  },
  {
    id: 'payment-1',
    category: '支付相关',
    question: '支持哪些支付方式？',
    answer: '目前支持支付宝、微信支付等主流支付方式。具体以下单页面显示为准。',
  },
  {
    id: 'payment-2',
    category: '支付相关',
    question: '退款政策是什么？',
    answer: '陪玩师确认前取消订单可全额退款。服务开始后如遇问题，请联系客服协商退款。',
  },
  {
    id: 'payment-3',
    category: '支付相关',
    question: '如何查看消费记录？',
    answer: '在个人中心的"消费记录"页面可以查看所有交易明细。',
  },
  {
    id: 'companion-1',
    category: '陪玩师相关',
    question: '如何成为陪玩师？',
    answer: '点击导航栏"成为陪玩"，填写申请表单，提交后等待管理员审核。审核通过后即可上架接单。',
  },
  {
    id: 'companion-2',
    category: '陪玩师相关',
    question: '陪玩师如何设置价格？',
    answer: '审核通过后，在陪玩工作台的"个人资料"页面可以设置您的服务价格。',
  },
  {
    id: 'companion-3',
    category: '陪玩师相关',
    question: '收入如何结算？',
    answer: '订单完成后收入会进入您的账户余额，支持提现到银行卡或支付宝。',
  },
  {
    id: 'security-1',
    category: '安全相关',
    question: '平台如何保障交易安全？',
    answer: '所有交易通过平台进行，资金由平台托管，确认服务完成后才会结算给陪玩师。',
  },
  {
    id: 'security-2',
    category: '安全相关',
    question: '遇到纠纷怎么办？',
    answer: '如遇纠纷，请保留相关证据并联系客服，我们会在24小时内介入处理。',
  },
  {
    id: 'security-3',
    category: '安全相关',
    question: '个人信息是否安全？',
    answer: '我们采用加密技术保护您的个人信息，不会向第三方泄露您的隐私数据。详见隐私政策页面。',
  },
];

const categories = ['全部', '账号相关', '下单相关', '支付相关', '陪玩师相关', '安全相关'];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFAQs = faqData.filter((item) => {
    const matchCategory = activeCategory === '全部' || item.category === activeCategory;
    const matchSearch =
      searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold">常见问题</h1>
          <p className="mt-2 opacity-90">找到你需要的答案</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <input
            type="text"
            placeholder="搜索问题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredFAQs.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-full px-2.5 py-0.5 flex-shrink-0">
                    {item.category}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{item.question}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    openItems.has(item.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openItems.has(item.id) && (
                <div className="px-5 pb-4 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
                  <p className="pt-3 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg">没有找到相关问题，请尝试其他关键词或联系客服</p>
          </div>
        )}

        <div className="mt-12 text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-8">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">还有其他问题？</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            如果以上内容没有解决您的问题，请联系我们获取帮助
          </p>
          <Link href="/contact" className="btn btn-primary">
            联系客服
          </Link>
        </div>
      </div>
    </div>
  );
}
