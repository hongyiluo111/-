[CmdletBinding()]
param()

$filePath = Join-Path $PSScriptRoot "src\app\orders\page.tsx"

$content = @'
'use client';

import { useState, useEffect, useMemo } from 'react';

const statusLabels: Record<string, string> = {
  pending: '待接单',
  accepted: '已接单',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentLabels: Record<string, string> = {
  unpaid: '未支付',
  paid: '已支付',
  refunded: '已退款',
};

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
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

  const handleCancelOrder = async (orderId: string) => {
    setCancelLoading(true);
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
        }
      }
    } catch (e) {
      console.error('取消订单失败:', e);
    } finally {
      setCancelLoading(false);
      setCancelConfirm(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">订单管理</h1>
          <p className="mt-2 opacity-90">查看和管理您的订单</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">{orderStats.total}</div>
            <div className="text-sm text-gray-500 mt-1">全部订单</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-yellow-600">{orderStats.pending}</div>
            <div className="text-sm text-gray-500 mt-1">待接单</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600">{orderStats.in_progress}</div>
            <div className="text-sm text-gray-500 mt-1">进行中</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">{orderStats.completed}</div>
            <div className="text-sm text-gray-500 mt-1">已完成</div>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold">订单列表</h2>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    statusFilter === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 mt-4">加载中...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mt-4">暂无订单</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {order.companionAvatar ? (
                          <img src={order.companionAvatar} alt={order.companionName} className="w-full h-full object-cover" />
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
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">💎{order.price}</div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">订单详情</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-white hover:text-gray-200 text-2xl">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {selectedOrder.companionAvatar ? (
                    <img src={selectedOrder.companionAvatar} alt={selectedOrder.companionName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                      {selectedOrder.companionName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{selectedOrder.companionName}</h4>
                  <p className="text-gray-500 text-sm">{selectedOrder.companionRank} - {selectedOrder.game}</p>
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
                  <div className="text-xs text-gray-500">价格</div>
                  <div className="mt-1 text-lg font-bold text-primary">💎{selectedOrder.price}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">订单编号</div>
                  <div className="mt-1 text-xs font-mono text-gray-600">{selectedOrder.id}</div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
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
                {selectedOrder.paymentMethod && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">支付方式</span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                )}
              </div>

              {(selectedOrder.status === 'pending' || selectedOrder.status === 'accepted' || selectedOrder.status === 'in_progress') && (
                cancelConfirm === selectedOrder.id ? (
                  <div className="p-4 bg-red-50 rounded-xl">
                    <p className="text-red-600 text-sm mb-3">确定要取消此订单吗？</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCancelConfirm(null)}
                        className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        再想想
                      </button>
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        disabled={cancelLoading}
                        className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        {cancelLoading ? '取消中...' : '确定取消'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCancelConfirm(selectedOrder.id)}
                    className="w-full py-3 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    取消订单
                  </button>
                )}
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'@

# Write with UTF8 encoding (with BOM for Windows compatibility)
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($true))
Write-Host "File written successfully"

# Verify
$verify = [System.IO.File]::ReadAllText($filePath, [System.Text.UTF8Encoding]::new($true))
$lines = $verify -split "`n"
Write-Host "Total lines: $($lines.Length)"
Write-Host "Line 6: $($lines[5])"
Write-Host "Line 130: $($lines[129])"
