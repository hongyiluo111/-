'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalCompanions: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  pendingReview: number;
}

interface TrendDay {
  date: string;
  count: number;
}

const statCards = [
  { key: 'totalUsers' as const, label: '总用户', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', gradient: 'from-blue-500 to-blue-600' },
  { key: 'totalCompanions' as const, label: '总陪玩', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', gradient: 'from-purple-500 to-purple-600' },
  { key: 'totalOrders' as const, label: '总订单', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', gradient: 'from-green-500 to-emerald-600' },
  { key: 'totalRevenue' as const, label: '总收入', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-amber-500 to-orange-500', prefix: '¥' },
  { key: 'todayOrders' as const, label: '今日新增订单', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', gradient: 'from-cyan-500 to-teal-500' },
  { key: 'pendingReview' as const, label: '待审核陪玩', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', gradient: 'from-rose-500 to-pink-500' },
];

const quickActions = [
  { title: '用户管理', desc: '查看用户账号、角色与封禁状态', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-blue-600 bg-blue-50' },
  { title: '陪玩管理', desc: '维护陪玩资料、状态与归属用户', href: '/admin/companions', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-purple-600 bg-purple-50' },
  { title: '订单管理', desc: '跟踪订单生命周期并处理状态流转', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-green-600 bg-green-50' },
  { title: '审核队列', desc: '审核待通过的陪玩申请', href: '/admin/companions/review', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-rose-600 bg-rose-50' },
];

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm animate-pulse dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-7 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<TrendDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/stats/trends'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          setTrends(trendsData.trends?.dailyOrders || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const maxTrendCount = trends.reduce((max, d) => Math.max(max, d.count), 0) || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">后台管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理用户、陪玩、订单和系统配置。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : statCards.map((card) => {
                const value = stats ? stats[card.key] : 0;
                return (
                  <div key={card.key} className="rounded-xl bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient}`}>
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {card.prefix}{typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">快捷操作</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${action.color} transition-transform group-hover:scale-110`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{action.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{action.desc}</p>
                </div>
                <svg className="mt-1 h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">近7日订单趋势</h2>
          {loading ? (
            <div className="flex h-48 items-end justify-between gap-2 px-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full animate-pulse rounded-t bg-gray-200 dark:bg-gray-700" style={{ height: `${30 + (i * 8) % 60}%` }} />
                  <div className="h-3 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : trends.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-gray-400 dark:text-gray-500">暂无订单数据</div>
          ) : (
            <div className="flex h-48 items-end justify-between gap-2 px-4">
              {trends.map((day) => {
                const heightPercent = Math.max((day.count / maxTrendCount) * 100, 4);
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">{day.count}</span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-primary to-[#1f7dd6] transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs text-gray-400">{day.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
