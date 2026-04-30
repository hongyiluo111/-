'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

const COMPANION_FILTER_STORAGE_KEY = 'admin_companions_filters_v1';

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

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface CompanionForm {
  id?: string;
  userId: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string;
  avatar: string;
  status: string;
}

const defaultForm: CompanionForm = {
  userId: '',
  name: '',
  game: '',
  rank: '',
  price: 0,
  description: '',
  avatar: '',
  status: 'pending',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

export default function CompanionsManagement() {
  const [companions, setCompanions] = useState<CompanionItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CompanionForm>(defaultForm);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'paused'>('all');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COMPANION_FILTER_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        searchKeyword?: string;
        statusFilter?: 'all' | 'active' | 'pending' | 'paused';
      };
      setSearchKeyword(parsed.searchKeyword || '');
      setStatusFilter(parsed.statusFilter || 'all');
    } catch {
      // ignore invalid localStorage content
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      COMPANION_FILTER_STORAGE_KEY,
      JSON.stringify({ searchKeyword, statusFilter })
    );
  }, [searchKeyword, statusFilter]);

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
      setUsers(data.users || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '获取陪玩列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const companionStats = useMemo(() => {
    let active = 0;
    let pending = 0;
    let paused = 0;

    for (const companion of companions) {
      if (companion.status === 'active') {
        active += 1;
      } else if (companion.status === 'pending') {
        pending += 1;
      } else {
        paused += 1;
      }
    }

    return {
      total: companions.length,
      active,
      pending,
      paused,
    };
  }, [companions]);

  const filteredCompanions = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return companions.filter((companion) => {
      if (statusFilter !== 'all' && companion.status !== statusFilter) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return (
        companion.name.toLowerCase().includes(keyword) ||
        companion.userName.toLowerCase().includes(keyword) ||
        companion.userEmail.toLowerCase().includes(keyword) ||
        companion.game.toLowerCase().includes(keyword)
      );
    });
  }, [companions, searchKeyword, statusFilter]);

  const openCreateModal = () => {
    setFormData({ ...defaultForm, userId: users[0]?.id || '' });
    setIsModalOpen(true);
  };

  const openEditModal = (companion: CompanionItem) => {
    setFormData({
      id: companion.id,
      userId: companion.userId,
      name: companion.name,
      game: companion.game,
      rank: companion.rank,
      price: companion.price,
      description: companion.description || '',
      avatar: companion.avatar || '',
      status: companion.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(defaultForm);
  };

  const handleSave = async () => {
    if (!formData.userId || !formData.name || !formData.game || !formData.rank) {
      setError('请填写必填信息');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const isEdit = Boolean(formData.id);
      const url = isEdit ? `/api/admin/companions/${formData.id}` : '/api/admin/companions';
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          name: formData.name,
          game: formData.game,
          rank: formData.rank,
          price: Number(formData.price),
          description: formData.description,
          avatar: formData.avatar,
          status: formData.status,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '保存陪玩失败');
      }

      await fetchData();
      closeModal();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '保存陪玩失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('确定要删除该陪玩吗？删除后不可恢复。');
    if (!confirmed) {
      return;
    }

    setError('');
    try {
      const response = await fetch(`/api/admin/companions/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '删除陪玩失败');
      }

      setCompanions((prev) => prev.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '删除陪玩失败');
    }
  };

  const resetFilters = () => {
    setSearchKeyword('');
    setStatusFilter('all');
    localStorage.removeItem(COMPANION_FILTER_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">陪玩管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">查看并维护平台陪玩资料与审核状态。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-primary">{companionStats.total}</div>
            <div className="mt-1 text-sm text-gray-500">总陪玩</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">{companionStats.active}</div>
            <div className="mt-1 text-sm text-gray-500">上架中</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-yellow-600">{companionStats.pending}</div>
            <div className="mt-1 text-sm text-gray-500">待审核</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-gray-700">{companionStats.paused}</div>
            <div className="mt-1 text-sm text-gray-500">已暂停</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">陪玩列表</h2>
              <div className="flex gap-2">
                <button onClick={fetchData} className="btn btn-secondary" disabled={loading}>
                  刷新
                </button>
                <button onClick={openCreateModal} className="btn btn-primary">
                  新增陪玩
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索陪玩/归属用户/游戏"
                className="input sm:max-w-sm"
              />
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'active', label: '上架中' },
                  { value: 'pending', label: '待审核' },
                  { value: 'paused', label: '已暂停' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value as 'all' | 'active' | 'pending' | 'paused')}
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
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : filteredCompanions.length === 0 ? (
            <div className="empty-state">暂无陪玩数据</div>
          ) : (
            <div className="table-shell overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>头像</th>
                    <th>昵称</th>
                    <th>归属用户</th>
                    <th>游戏/段位</th>
                    <th>价格</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCompanions.map((companion) => (
                    <tr key={companion.id}>
                      <td>
                        {companion.avatar ? (
                          <Image
                            src={companion.avatar}
                            alt={companion.name}
                            width={40}
                            height={40}
                            sizes="40px"
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">无</div>
                        )}
                      </td>
                      <td className="text-gray-900">{companion.name}</td>
                      <td className="text-gray-600">
                        <div>{companion.userName}</div>
                        <div className="text-xs text-gray-400">{companion.userEmail}</div>
                      </td>
                      <td className="text-gray-700">
                        <div>{companion.game}</div>
                        <div className="text-xs text-gray-400">{companion.rank}</div>
                      </td>
                      <td className="font-medium text-primary">￥{companion.price}</td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            companion.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : companion.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {companion.status}
                        </span>
                      </td>
                      <td className="text-gray-600">{formatDate(companion.createdAt)}</td>
                      <td>
                        <button onClick={() => openEditModal(companion)} className="mr-3 text-blue-600 hover:text-blue-800">
                          编辑
                        </button>
                        <button onClick={() => handleDelete(companion.id)} className="text-red-600 hover:text-red-800">
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6">
            <h3 className="mb-4 text-xl font-semibold">{formData.id ? '编辑陪玩' : '新增陪玩'}</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-gray-600">归属用户</label>
                <select
                  className="input"
                  value={formData.userId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                >
                  <option value="">请选择用户</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-600">昵称</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">状态</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">pending</option>
                  <option value="active">active</option>
                  <option value="paused">paused</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">游戏</label>
                <input
                  className="input"
                  value={formData.game}
                  onChange={(e) => setFormData((prev) => ({ ...prev, game: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">段位</label>
                <input
                  className="input"
                  value={formData.rank}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rank: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">单价（元/小时）</label>
                <input
                  type="number"
                  className="input"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">头像 URL</label>
                <input
                  className="input"
                  value={formData.avatar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, avatar: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm text-gray-600">描述</label>
                <textarea
                  className="input min-h-24"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className="btn btn-secondary" disabled={saving}>
                取消
              </button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
