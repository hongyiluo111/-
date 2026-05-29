'use client';

import { useInView } from '@/hooks/useInView';

const steps = [
  {
    number: 1,
    title: '选择游戏',
    description: '浏览支持的游戏列表，找到你喜爱的游戏',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: '筛选陪玩',
    description: '根据游戏、段位、价格筛选合适的陪玩师',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: '下单预约',
    description: '选择时间，提交预约，等待陪玩师确认',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: '开始游戏',
    description: '享受专业陪玩服务，提升游戏体验',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''} my-16`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 text-gradient">如何使用</h2>
        <p className="text-gray-500 dark:text-gray-400">简单四步，开始你的游戏之旅</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-gray-300 dark:border-gray-600" />
        {steps.map((step) => (
          <div key={step.number} className="relative flex flex-col items-center text-center">
            <div className="relative z-10 w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold absolute -top-2 -right-2">
                {step.number}
              </div>
              <div className="text-primary dark:text-blue-400">
                {step.icon}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {step.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
