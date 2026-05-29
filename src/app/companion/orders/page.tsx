'use client';

import { useEffect, useMemo, useState } from 'react';
import { statusLabels, statusColors } from '@/data/orderConstants';
import { formatDate } from '@/utils/date';

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待接单' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

interface CompanionOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  game: string;
  price: number;
  duration: number | null;
  status: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CompanionOrdersPage() {
  const [orders, setOrders] = useState<CompanionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/companion/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('获取订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId: string, action: 'accept' | 'reject' | 'start' | 'complete', body?: Record<string, string>) => {
    setActionLoading(orderId);
    try {
      const response = await fetch(`/api/companion/orders/${orderId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) {
        await fetchOrders();
      }
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setActionLoading(null);
      setRejectModal(null);
      setRejectReason('');
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    if (statusFilter === 'in_progress') {
      return orders.filter((o) => o.status === 'accepted' || o.status === 'in_progress');
    }
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      in_progress: orders.filter((o) => o.status === 'accepted' || o.status === 'in_progress').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  const getActionButtons = (order: CompanionOrder) => {
    if (actionLoading === order.id) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
          处理中...
        </div>
      );
    }

    switch (order.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRejectModal(order.id);
              }}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50"
            >
              拒单
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(order.id, 'accept');
              }}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary/90"
            >
              接单
            </button>
          </div>
        );
      case 'accepted':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(order.id, 'start');
            }}
            className="rounded-lg bg-purple-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-purple-600"
          >
            开始服务
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAction(order.id, 'complete');
            }}
            className="rounded-lg bg-green-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-600"
          >
            完成服务
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">订单管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理接收到的订单，接单、开始服务或完成订单。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-primary">{orderStats.total}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">总订单</div>
          </div>
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">待接单</div>
          </div>
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-purple-600">{orderStats.in_progress}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">进行中</div>
          </div>
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">已完成</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">伴伴订单</h2>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    statusFilter === option.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <svg className="mx-auto mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>暂无订单</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                        {order.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 dark:text-gray-100">{order.userName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div className="mt-0.5 text-sm text-gray-500">
                          {order.game}
                          {order.duration ? ` · ${order.duration}小时` : ''}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">￥{order.price}</div>
                      </div>
                      {getActionButtons(order)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">拒单确认</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">请输入拒单原因（可选）：</p>
            <textarea
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 p-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
              placeholder="拒单原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason('');
                }}
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                取消
              </button>
              <button
                onClick={() => handleAction(rejectModal, 'reject', { reason: rejectReason })}
                disabled={actionLoading === rejectModal}
                className="flex-1 rounded-lg bg-red-500 py-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading === rejectModal ? '处理中...' : '确定拒单'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
