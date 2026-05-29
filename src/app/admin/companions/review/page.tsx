'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/utils/date';
import AdminGuard from '@/components/AdminGuard';

interface CompanionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string;
  avatar: string;
  status: string;
  createdAt: string;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm animate-pulse">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function CompanionReviewPage() {
  const [companions, setCompanions] = useState<CompanionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchData = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/companions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取陪玩列表失败');
      }

      setCompanions(data.companions || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '获取陪玩列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const pendingCompanions = useMemo(() => {
    return companions.filter((c) => c.status === 'pending');
  }, [companions]);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/companions/${id}/approve`, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '审核通过失败');
      }

      setCompanions((prev) => prev.filter((c) => c.id !== id));
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : '审核通过失败');
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectModalId(id);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setRejectModalId(null);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!rejectModalId) return;

    setActionId(rejectModalId);
    try {
      const response = await fetch(`/api/admin/companions/${rejectModalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '审核拒绝失败');
      }

      setCompanions((prev) => prev.filter((c) => c.id !== rejectModalId));
      closeRejectModal();
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : '审核拒绝失败');
    } finally {
      setActionId(null);
    }
  };

  return (
    <AdminGuard>
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">审核队列</h1>
          <p className="mt-3 max-w-2xl text-white/90">审核待通过的陪玩申请，确保平台陪玩质量。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {error && <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : pendingCompanions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-sm dark:bg-gray-800">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mt-5 text-lg font-medium text-gray-700 dark:text-gray-200">审核队列已清空</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">当前没有待审核的陪玩申请，所有申请已处理完毕</p>
            <div className="mt-6 flex gap-3">
              <Link href="/admin" className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                返回管理后台
              </Link>
              <Link href="/admin/companions" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90">
                查看陪玩管理
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">共 {pendingCompanions.length} 个待审核申请</p>
              <button onClick={fetchData} className="rounded-lg bg-white px-4 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50">
                刷新
              </button>
            </div>
            {pendingCompanions.map((companion) => (
              <div key={companion.id} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="flex items-center gap-4 md:flex-shrink-0">
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                      {companion.avatar ? (
                        <Image
                          src={companion.avatar}
                          alt={companion.name}
                          width={64}
                          height={64}
                          sizes="64px"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                          {companion.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{companion.name}</h3>
                      <p className="text-sm text-gray-500">
                        申请人: {companion.userName} ({companion.userEmail})
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1 text-sm text-blue-700">
                        {companion.game}
                      </span>
                      <span className="inline-flex items-center rounded-lg bg-purple-50 px-3 py-1 text-sm text-purple-700">
                        {companion.rank}
                      </span>
                      <span className="inline-flex items-center rounded-lg bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                        ¥{companion.price}/小时
                      </span>
                    </div>

                    {companion.description && (
                      <p className="text-sm leading-relaxed text-gray-600">{companion.description}</p>
                    )}

                    <p className="text-xs text-gray-400">申请时间: {formatDate(companion.createdAt)}</p>
                  </div>

                  <div className="flex gap-3 md:flex-shrink-0">
                    <button
                      onClick={() => handleApprove(companion.id)}
                      disabled={actionId === companion.id}
                      className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionId === companion.id ? '处理中...' : '通过'}
                    </button>
                    <button
                      onClick={() => openRejectModal(companion.id)}
                      disabled={actionId === companion.id}
                      className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                      拒绝
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">拒绝申请</h3>
            <p className="mb-3 text-sm text-gray-500">请输入拒绝原因（可选）</p>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              rows={4}
              placeholder="请输入拒绝原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeRejectModal} className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200">
                取消
              </button>
              <button
                onClick={handleReject}
                disabled={actionId !== null}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {actionId ? '处理中...' : '确认拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminGuard>
  );
}
