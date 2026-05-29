'use client';

import { useEffect, useState } from 'react';
import CountUp from '@/components/CountUp';
import { useInView } from '@/hooks/useInView';

interface Stats {
  users: number;
  companions: number;
  orders: number;
  avgRating: number;
}

export default function PlatformStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { ref, isVisible } = useInView(0.1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats/public');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {}
    };
    fetchStats();
  }, []);

  const items = stats
    ? [
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          label: '注册用户',
          value: stats.users,
          suffix: '人',
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: '活跃陪玩',
          value: stats.companions,
          suffix: '位',
          color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
          label: '完成订单',
          value: stats.orders,
          suffix: '单',
          color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
        },
        {
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
          label: '好评率',
          value: stats.avgRating,
          suffix: '分',
          color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400',
          isDecimal: true,
        },
      ]
    : [];

  return (
    <section ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''} bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 my-12`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 text-gradient">平台数据</h2>
        <p className="text-gray-500 dark:text-gray-400">真实可靠的数据，见证平台成长</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats
          ? items.map((item) => (
              <div
                key={item.label}
                className="card text-center py-8"
              >
                <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4`}>
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {item.isDecimal ? (
                    <span>{stats.avgRating.toFixed(1)}</span>
                  ) : (
                    <CountUp end={item.value} />
                  )}
                  <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">{item.suffix}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.label}</p>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card text-center py-8 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
              </div>
            ))}
      </div>
    </section>
  );
}
