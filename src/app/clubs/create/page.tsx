'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserStore } from '@/store/user';

const GAMES = ['三角洲行动', '王者荣耀', '英雄联盟', '和平精英', 'CS2', '无畏契约', '金铲铲之战', '穿越火线'];

export default function CreateClubPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">请先登录</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">登录后才能创建俱乐部</p>
        <Link
          href="/login"
          className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
        >
          去登录
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          gameId,
          description: description || undefined,
          avatar: avatar || undefined,
          banner: banner || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建失败');
      }

      router.push('/clubs/' + data.club.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">创建俱乐部</h1>
          <p className="mt-2 opacity-90">建立你的游戏俱乐部，邀请志同道合的伙伴加入</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">俱乐部信息</h2>

          {error && <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">俱乐部名称 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="请输入俱乐部名称"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">游戏 *</label>
                <select
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  className="select cursor-pointer"
                  required
                >
                  <option value="">请选择游戏</option>
                  {GAMES.map((game) => (
                    <option key={game} value={game}>{game}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">俱乐部简介</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input h-32"
                placeholder="介绍一下你的俱乐部（选填）"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">头像 URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="input"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">横幅 URL</label>
                <input
                  type="text"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  className="input"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Link href="/clubs" className="btn btn-secondary text-center">
                取消
              </Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '创建中...' : '创建俱乐部'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
