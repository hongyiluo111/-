'use client';

import { useEffect, useMemo, useState } from 'react';

const USER_FILTER_STORAGE_KEY = 'admin_users_filters_v1';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'banned';
  createdAt: string;
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

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_FILTER_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { searchKeyword?: string; statusFilter?: 'all' | 'active' | 'banned' };
      setSearchKeyword(parsed.searchKeyword || '');
      setStatusFilter(parsed.statusFilter || 'all');
    } catch {
      // ignore invalid localStorage content
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      USER_FILTER_STORAGE_KEY,
      JSON.stringify({ searchKeyword, statusFilter })
    );
  }, [searchKeyword, statusFilter]);

  const fetchUsers = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取用户列表失败');
      }

      setUsers(data.users || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const userStats = useMemo(() => {
    let activeCount = 0;
    let bannedCount = 0;
    let adminCount = 0;

    for (const user of users) {
      if (user.status === 'active') {
        activeCount += 1;
      }
      if (user.status === 'banned') {
        bannedCount += 1;
      }
      if (user.role === 'admin') {
        adminCount += 1;
      }
    }

    return {
      total: users.length,
      active: activeCount,
      banned: bannedCount,
      admin: adminCount,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return users.filter((user) => {
      if (statusFilter !== 'all' && user.status !== statusFilter) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return (
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword)
      );
    });
  }, [searchKeyword, statusFilter, users]);

  const toggleUserStatus = async (user: UserItem) => {
    if (user.role === 'admin') {
      return;
    }

    setUpdatingUserId(user.id);
    setError('');
    try {
      const targetStatus: 'active' | 'banned' = user.status === 'active' ? 'banned' : 'active';
      const response = await fetch('/api/admin/users/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status: targetStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '更新用户状态失败');
      }

      setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, status: targetStatus } : item)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : '更新用户状态失败');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const resetFilters = () => {
    setSearchKeyword('');
    setStatusFilter('all');
    localStorage.removeItem(USER_FILTER_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理平台用户账户、角色与封禁状态。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-primary">{userStats.total}</div>
            <div className="mt-1 text-sm text-gray-500">总用户</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
            <div className="mt-1 text-sm text-gray-500">正常用户</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-red-600">{userStats.banned}</div>
            <div className="mt-1 text-sm text-gray-500">封禁用户</div>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-blue-600">{userStats.admin}</div>
            <div className="mt-1 text-sm text-gray-500">管理员</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">用户列表</h2>
              <button onClick={fetchUsers} className="btn btn-secondary" disabled={loading}>
                刷新
              </button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索用户名 / 邮箱 / ID"
                className="input sm:max-w-sm"
              />
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'active', label: '正常' },
                  { value: 'banned', label: '封禁' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value as 'all' | 'active' | 'banned')}
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
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">暂无用户数据</div>
          ) : (
            <div className="table-shell overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>邮箱</th>
                    <th>角色</th>
                    <th>状态</th>
                    <th>创建时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="text-gray-700">{user.id}</td>
                      <td className="text-gray-900">{user.name}</td>
                      <td className="text-gray-600">{user.email}</td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.status === 'active' ? '正常' : '封禁'}
                        </span>
                      </td>
                      <td className="text-gray-600">{formatDate(user.createdAt)}</td>
                      <td>
                        {user.role === 'admin' ? (
                          <span className="text-gray-400">不可操作</span>
                        ) : (
                          <button
                            onClick={() => toggleUserStatus(user)}
                            disabled={updatingUserId === user.id}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {updatingUserId === user.id ? '处理中...' : user.status === 'active' ? '封禁' : '解封'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
