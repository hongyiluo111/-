'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const games = ['三角洲行动', '王者荣耀', '英雄联盟', '和平精英', 'CS2', '无畏契约', '穿越火线', '金铲铲之战'];

const gameRanks: Record<string, string[]> = {
  '三角洲行动': ['列兵', '上等兵', '下士', '中士', '上士', '少尉', '中尉', '上尉', '少校', '中校', '上校', '少将'],
  '王者荣耀': ['青铜', '白银', '黄金', '铂金', '钻石', '星耀', '王者', '荣耀王者'],
  '英雄联盟': ['黑铁', '青铜', '白银', '黄金', '铂金', '翡翠', '钻石', '大师', '宗师', '王者'],
  '和平精英': ['青铜', '白银', '黄金', '铂金', '钻石', '星耀', '王牌', '无敌战神'],
  'CS2': ['白银', '黄金', '铂金', '钻石', '大师', '精英大师', '全球精英'],
  '无畏契约': ['黑铁', '青铜', '白银', '黄金', '铂金', '钻石', '超凡入圣', '神话', '传奇'],
  '穿越火线': ['新兵', '列兵', '上等兵', '下士', '中士', '上士', '少尉', '中尉', '上尉', '少校', '中校', '上校', '大校', '少将', '中将', '上将'],
  '金铲铲之战': ['青铜', '白银', '黄金', '铂金', '钻石', '大师', '王者'],
};

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '审核中', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  active: { label: '已上架', color: 'bg-green-100 text-green-700 border-green-300' },
  paused: { label: '已暂停', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  inactive: { label: '已下架', color: 'bg-red-100 text-red-700 border-red-300' },
};

interface CompanionProfile {
  id: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string | null;
  avatar: string | null;
  status: string;
  rating: number;
  ratingCount: number;
  totalOrders: number;
  totalEarnings: number;
  isOnline: boolean;
  createdAt: string;
}

export default function CompanionProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    rank: '',
    price: '',
    description: '',
    avatar: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/companion/profile');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.status === 404) {
        router.push('/become-companion');
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '获取资料失败');
      }
      setProfile(data.companion);
      setFormData({
        name: data.companion.name,
        game: data.companion.game,
        rank: data.companion.rank,
        price: String(data.companion.price),
        description: data.companion.description || '',
        avatar: data.companion.avatar || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取资料失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'game') {
        next.rank = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/companion/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          game: formData.game,
          rank: formData.rank,
          price: Number(formData.price),
          description: formData.description,
          avatar: formData.avatar,
        }),
      });
      const data = await response.json();

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || '更新失败');
      }

      setProfile(data.companion);
      setSuccess('资料已更新');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold">编辑资料</h1>
            <p className="mt-2 opacity-90">管理你的陪玩个人信息</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="card max-w-2xl mx-auto animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  const availableRanks = formData.game ? gameRanks[formData.game] || [] : [];
  const statusInfo = profile ? statusMap[profile.status] || statusMap.pending : null;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">编辑资料</h1>
          <p className="mt-2 opacity-90">管理你的陪玩个人信息</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="card max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">陪玩资料</h2>
            {statusInfo && (
              <span className={`px-3 py-1 rounded-full text-sm border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            )}
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">昵称</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">游戏</label>
                <select name="game" value={formData.game} onChange={handleChange} className="select" required>
                  <option value="">请选择游戏</option>
                  {games.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">段位</label>
                <select name="rank" value={formData.rank} onChange={handleChange} className="select" required>
                  <option value="">请选择段位</option>
                  {availableRanks.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">价格（元/小时）</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} className="input" min="1" required />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">头像URL</label>
              <input type="url" name="avatar" value={formData.avatar} onChange={handleChange} className="input" placeholder="https://example.com/avatar.jpg" />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">个人介绍</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input h-32" placeholder="介绍一下你的游戏经历和特长..."></textarea>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
