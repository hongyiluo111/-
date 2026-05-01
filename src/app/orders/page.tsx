'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { statusLabels, statusColors, paymentLabels } from '@/data/orderConstants';
import { formatDate } from '@/utils/date';

const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待接单' },
  { value: 'accepted', label: '已接单' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const cancellableStatuses = new Set(['pending', 'accepted', 'in_progress']);

interface Order {
  id: string;
  companionId: string;
  companionName: string;
  companionRank: string;
  companionAvatar: string | null;
  game: string;
  price: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
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

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    setCancelLoading(true);
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: 'cancelled' } : order)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
        }
      }
    } catch (error) {
      console.error('取消订单失败:', error);
    } finally {
      setCancelLoading(false);
      setCancelConfirm(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }

    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const orderStats = useMemo(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
    };

    for (const order of orders) {
      if (order.status === 'pending') {
        stats.pending += 1;
      }

      if (order.status === 'accepted' || order.status === 'in_progress') {
        stats.in_progress += 1;
      }

      if (order.status === 'completed') {
        stats.completed += 1;
      }
    }

    return stats;
  }, [orders]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">订单管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">查看订单状态、支付进度并在可取消阶段快速处理。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-primary">{orderStats.total}</div>
            <div className="mt-1 text-sm text-gray-500">总订单</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <div className="mt-1 text-sm text-gray-500">待接单</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-purple-600">{orderStats.in_progress}</div>
            <div className="mt-1 text-sm text-gray-500">进行中</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
            <div className="mt-1 text-sm text-gray-500">已完成</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-xl font-semibold">我的订单</h2>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    statusFilter === option.value ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
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
                  className="cursor-pointer rounded-2xl border border-gray-200/80 bg-white/80 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                        {order.companionAvatar ? (
                          <Image
                            src={order.companionAvatar}
                            alt={order.companionName}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                            {order.companionName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{order.companionName}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div className="mt-0.5 text-sm text-gray-500">
                          {order.game} - {order.companionRank}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">￥{order.price}</div>
                        <div className="text-xs text-gray-400">{formatDate(order.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white">
            <div className="rounded-t-3xl bg-gradient-to-r from-primary to-accent p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">订单详情</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-2xl text-white hover:text-gray-200">
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {selectedOrder.companionAvatar ? (
                    <Image
                      src={selectedOrder.companionAvatar}
                      alt={selectedOrder.companionName}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                      {selectedOrder.companionName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{selectedOrder.companionName}</h4>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.companionRank} - {selectedOrder.game}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">订单状态</div>
                  <div className="mt-1">
                    <span className={`rounded-full px-2 py-1 text-xs ${statusColors[selectedOrder.status]}`}>
                      {statusLabels[selectedOrder.status]}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">支付状态</div>
                  <div className="mt-1 font-medium">{paymentLabels[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">订单价格</div>
                  <div className="mt-1 font-bold text-primary">￥{selectedOrder.price}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">支付方式</div>
                  <div className="mt-1 font-medium">{selectedOrder.paymentMethod || '未选择'}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">订单编号</span>
                  <span className="font-mono">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">创建时间</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">更新时间</span>
                  <span>{formatDate(selectedOrder.updatedAt)}</span>
                </div>
                {selectedOrder.completedAt && (
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500">完成时间</span>
                    <span>{formatDate(selectedOrder.completedAt)}</span>
                  </div>
                )}
              </div>

              {cancellableStatuses.has(selectedOrder.status) &&
                (cancelConfirm === selectedOrder.id ? (
                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="mb-3 text-sm text-red-600">确定要取消此订单吗？</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCancelConfirm(null)}
                        className="flex-1 rounded-lg border border-gray-200 bg-white py-2 text-gray-600 hover:bg-gray-50"
                      >
                        再想想
                      </button>
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        disabled={cancelLoading}
                        className="flex-1 rounded-lg bg-red-500 py-2 text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        {cancelLoading ? '取消中...' : '确定取消'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCancelConfirm(selectedOrder.id)}
                    className="w-full rounded-xl border-2 border-red-200 py-3 text-red-500 transition-colors hover:bg-red-50"
                  >
                    取消订单
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
