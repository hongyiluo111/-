'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/date';

interface EarningsData {
  stats: {
    totalEarnings: number;
    thisMonthEarnings: number;
    pendingSettlement: number;
    totalOrders: number;
  };
  earnings: {
    id: string;
    orderId: string;
    game: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
}

const statusLabels: Record<string, string> = {
  pending: '待结算',
  settled: '已结算',
  withdrawn: '已提现',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  settled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  withdrawn: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

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

export default function CompanionEarnings() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await fetch('/api/companion/earnings');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('获取收入数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const stats = [
    { label: '累计收入', value: `¥${data?.stats.totalEarnings.toFixed(2) ?? '0.00'}`, color: 'text-green-600' },
    { label: '本月收入', value: `¥${data?.stats.thisMonthEarnings.toFixed(2) ?? '0.00'}`, color: 'text-blue-600' },
    { label: '待结算', value: `¥${data?.stats.pendingSettlement.toFixed(2) ?? '0.00'}`, color: 'text-yellow-600' },
    { label: '累计接单', value: data?.stats.totalOrders ?? 0, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">我的收入</h1>

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
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">收入明细</h2>
        {loading ? (
          <TableSkeleton />
        ) : !data?.earnings?.length ? (
          <div className="py-12 text-center text-gray-400">
            <svg className="mx-auto mb-4 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>暂无收入记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">订单编号</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">游戏</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">金额</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">状态</th>
                  <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.earnings.map((earning) => (
                  <tr key={earning.id}>
                    <td className="py-3 font-mono text-gray-900 dark:text-gray-100">{earning.orderId.slice(0, 8)}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{earning.game}</td>
                    <td className="py-3 font-medium text-gray-900 dark:text-gray-100">¥{earning.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[earning.status]}`}>
                        {statusLabels[earning.status]}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">{formatDate(earning.createdAt)}</td>
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
