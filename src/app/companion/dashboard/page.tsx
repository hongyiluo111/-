'use client';

import { useState, useEffect } from 'react';
import { statusLabels, statusColors } from '@/data/orderConstants';
import { formatDate } from '@/utils/date';

interface DashboardData {
  todayOrders: number;
  todayEarnings: number;
  pendingOrders: number;
  avgRating: number;
  isOnline: boolean;
  recentOrders: {
    id: string;
    userName: string;
    game: string;
    price: number;
    status: string;
    createdAt: string;
  }[];
}

function StatCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 flex-1 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
}

export default function CompanionDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/companion/dashboard');
        if (response.ok) {
          const result = await response.json();
          setData(result);
          setIsOnline(result.isOnline);
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const response = await fetch('/api/companion/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: !isOnline }),
      });
      if (response.ok) {
        setIsOnline(!isOnline);
      }
    } catch (error) {
      console.error('切换在线状态失败:', error);
    } finally {
      setToggling(false);
    }
  };

  const stats = [
    { label: '今日订单数', value: data?.todayOrders ?? 0, color: 'text-blue-600' },
    { label: '今日收入', value: `¥${data?.todayEarnings ?? 0}`, color: 'text-green-600' },
    { label: '待接单数', value: data?.pendingOrders ?? 0, color: 'text-yellow-600' },
    { label: '累计评分', value: data?.avgRating?.toFixed(1) ?? '0.0', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">工作台概览</h1>
        <button
          onClick={handleToggleOnline}
          disabled={toggling || loading}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
            isOnline
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
          {toggling ? '切换中...' : isOnline ? '在线接单' : '暂停接单'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">最近订单</h2>
        {loading ? (
          <TableSkeleton />
        ) : !data?.recentOrders?.length ? (
          <div className="py-12 text-center text-gray-400">
            <svg className="mx-auto mb-4 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>暂无订单记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">订单编号</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">用户</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">游戏</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">金额</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">状态</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-mono text-gray-900 dark:text-gray-100">{order.id.slice(0, 8)}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{order.userName}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{order.game}</td>
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-100">¥{order.price}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
