'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { statusLabels, statusColors, paymentLabels } from '@/data/orderConstants';
import { formatDate } from '@/utils/date';
import AdminGuard from '@/components/AdminGuard';

const ORDER_FILTER_STORAGE_KEY = 'admin_orders_filters_v1';

interface Order {
  id: string;
  userId: string;
  userEmail: string;
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

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDER_FILTER_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { searchKeyword?: string; statusFilter?: string };
      setSearchKeyword(parsed.searchKeyword || '');
      setStatusFilter(parsed.statusFilter || 'all');
    } catch {
      // ignore invalid localStorage content
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      ORDER_FILTER_STORAGE_KEY,
      JSON.stringify({ searchKeyword, statusFilter })
    );
  }, [searchKeyword, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('获取订单失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (e) {
      console.error('更新订单状态失败:', e);
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return (
        o.companionName.toLowerCase().includes(keyword) ||
        o.userEmail.toLowerCase().includes(keyword) ||
        o.id.toLowerCase().includes(keyword) ||
        o.game.toLowerCase().includes(keyword)
      );
    });
  }, [orders, searchKeyword, statusFilter]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      in_progress: orders.filter((o) => o.status === 'in_progress' || o.status === 'accepted').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'pending', label: '待接单' },
    { value: 'accepted', label: '已接单' },
    { value: 'in_progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  const resetFilters = () => {
    setSearchKeyword('');
    setStatusFilter('all');
    localStorage.removeItem(ORDER_FILTER_STORAGE_KEY);
  };

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">订单管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理平台所有用户订单并维护状态流转。</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-primary">{orderStats.total}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">总订单</div>
          </div>
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">待接单</div>
          </div>
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-purple-600">{orderStats.in_progress}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">进行中</div>
          </div>
          <div className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">{orderStats.completed}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">已完成</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/90 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 p-6 shadow-lg">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">所有订单</h2>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索订单号 / 用户邮箱 / 陪玩"
                className="input sm:max-w-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                    statusFilter === option.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={resetFilters}
                className="rounded-xl px-3 py-2 text-sm bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
              >
                重置
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {order.companionAvatar ? (
                          <Image
                            src={order.companionAvatar}
                            alt={order.companionName}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                            {order.companionName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{order.companionName}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {order.game} - {order.companionRank}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          用户: {order.userEmail}
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
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">订单详情</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-white hover:text-gray-200 text-2xl">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {selectedOrder.companionAvatar ? (
                    <Image
                      src={selectedOrder.companionAvatar}
                      alt={selectedOrder.companionName}
                      width={64}
                      height={64}
                      sizes="64px"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                      {selectedOrder.companionName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{selectedOrder.companionName}</h4>
                  <p className="text-gray-500 text-sm">{selectedOrder.companionRank} - {selectedOrder.game}</p>
                  <p className="text-gray-400 text-xs mt-1">用户: {selectedOrder.userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">订单状态</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedOrder.status]}`}>
                      {statusLabels[selectedOrder.status]}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">支付状态</div>
                  <div className="mt-1 font-medium">{paymentLabels[selectedOrder.paymentStatus] || selectedOrder.paymentStatus}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">订单价格</div>
                  <div className="mt-1 font-bold text-primary">￥{selectedOrder.price}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">支付方式</div>
                  <div className="mt-1 font-medium">{selectedOrder.paymentMethod || '未选择'}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">订单编号</span>
                  <span className="font-mono">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">用户ID</span>
                  <span className="font-mono">{selectedOrder.userId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">创建时间</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">更新时间</span>
                  <span>{formatDate(selectedOrder.updatedAt)}</span>
                </div>
                {selectedOrder.completedAt && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">完成时间</span>
                    <span>{formatDate(selectedOrder.completedAt)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">更新订单状态</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => handleUpdateStatus(selectedOrder.id, value)}
                      disabled={selectedOrder.status === value}
                      className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                        selectedOrder.status === value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}
