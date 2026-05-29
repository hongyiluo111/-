'use client';

import { useInView } from '@/hooks/useInView';

const testimonials = [
  {
    name: '小明',
    game: '王者荣耀',
    text: '陪玩师技术很强，带我上了星耀！服务态度也很好。',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    name: '游戏达人',
    game: '英雄联盟',
    text: '终于找到靠谱的陪玩了，每局都很认真，推荐！',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    name: '萌新小白',
    game: '和平精英',
    text: '作为新手，陪玩师很耐心地教我，现在进步很大。',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    name: '电竞少女',
    game: '无畏契约',
    text: '小姐姐陪玩太温柔了，游戏体验直接拉满！',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    name: '老玩家',
    game: 'CS2',
    text: '专业水平很高，学到了很多实用技巧，物超所值。',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    name: '快乐玩家',
    game: '三角洲行动',
    text: '组队开黑太开心了，以后就在这找陪玩了！',
    gradient: 'from-green-500 to-emerald-600',
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-yellow-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''} my-16`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 text-gradient">用户好评</h2>
        <p className="text-gray-500 dark:text-gray-400">听听他们怎么说</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((item) => (
          <div
            key={item.name}
            className="card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                {item.name.charAt(0)}
              </div>
              <div className="ml-3">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {item.game}
                </span>
              </div>
            </div>
            <StarRating />
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              &ldquo;{item.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
