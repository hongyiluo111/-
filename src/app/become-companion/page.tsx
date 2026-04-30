'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const games = ['三角洲行动', '王者荣耀', '英雄联盟', '和平精英', 'CS2', 'DOTA2', 'VALORANT', '金铲铲之战'];
const ranks = ['青铜', '白银', '黄金', '铂金', '钻石', '大师', '王者'];

export default function BecomeCompanionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    rank: '',
    price: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/companions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          game: formData.game,
          rank: formData.rank,
          price: Number(formData.price),
          description: formData.description,
        }),
      });
      const data = await response.json();

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || '申请失败');
      }

      setSuccess('申请已提交，等待审核通过后将上架。');
      setFormData({
        name: '',
        game: '',
        rank: '',
        price: '',
        description: '',
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '申请失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">申请成为陪玩</h1>
          <p className="mt-2 opacity-90">填写你的游戏信息与服务报价，提交后由平台审核</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">陪玩申请表</h2>

          {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-700">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">展示昵称</label>
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
                  {ranks.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">价格（元/小时）</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="input"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">个人介绍</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input h-32"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
