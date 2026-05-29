'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserStore } from '@/store/user';
import { getGameColor } from '@/data/gameColors';

const GAMES = ['三角洲行动', '王者荣耀', '英雄联盟', '和平精英', 'CS2', '无畏契约', '金铲铲之战', '穿越火线'];

interface Club {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;
  gameId: string;
  ownerId: string;
  ownerName: string;
  memberCount: number;
  status: string;
  members: number;
  createdAt: string;
}

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'C';
}

function truncate(text: string, max: number) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-2 -mx-6 -mt-6 mb-4 bg-gray-200 dark:bg-gray-700" />
      <div className="flex items-center mb-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="ml-3 flex-1 space-y-2">
          <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function ClubsPage() {
  const { user, setUser } = useUserStore();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('members');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!user) {
      const loadUser = async () => {
        try {
          const response = await fetch('/api/auth/current-user');
          if (!response.ok) return;
          const userData = await response.json();
          if (userData) setUser(userData);
        } catch {}
      };
      loadUser();
    }
  }, [setUser, user]);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (game) params.set('game', game);
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);
        const response = await fetch(`/api/clubs?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setClubs(data.clubs || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, [game, search, sort]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const displayedClubs = useMemo(() => clubs, [clubs]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">俱乐部</h1>
            <p className="mt-3 max-w-2xl text-white/90">加入志同道合的游戏俱乐部，与更多玩家一起开黑交流。</p>
          </div>
          <Link
            href={user ? '/clubs/create' : '/login'}
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-5 py-3 text-sm font-medium text-white hover:bg-white/30 transition-all whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            创建俱乐部
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="card mb-8 sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/90 shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">游戏</label>
              <select className="select cursor-pointer" value={game} onChange={(e) => setGame(e.target.value)}>
                <option value="">全部游戏</option>
                {GAMES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">搜索</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input"
                  placeholder="搜索俱乐部名称..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button type="button" onClick={handleSearch} className="btn btn-primary whitespace-nowrap">
                  搜索
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-700 dark:text-gray-300">排序</label>
              <select className="select cursor-pointer" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="members">成员数</option>
                <option value="newest">最新</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayedClubs.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🏕️</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">暂无俱乐部</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search || game ? '没有找到符合条件的俱乐部，请尝试调整筛选条件' : '还没有俱乐部，快来创建第一个吧！'}
            </p>
            {user && (
              <Link href="/clubs/create" className="btn btn-primary">
                创建俱乐部
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedClubs.map((club) => {
              const gameColor = getGameColor(club.gameId);
              return (
                <Link
                  key={club.id}
                  href={`/clubs/${club.id}`}
                  className="card interactive-card group relative flex flex-col overflow-hidden border border-white/90 dark:border-gray-700"
                >
                  <div className={`h-2 bg-gradient-to-r ${gameColor}`} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center mb-4">
                      <div className="relative">
                        <div className="h-14 w-14 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800 bg-gray-200 dark:bg-gray-700">
                          {club.avatar ? (
                            <Image
                              src={club.avatar}
                              alt={club.name}
                              width={56}
                              height={56}
                              sizes="56px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className={`flex h-full w-full items-center justify-center text-xl font-bold text-white bg-gradient-to-r ${gameColor}`}>
                              {getInitials(club.name)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                          {club.name}
                        </h3>
                        <p className={`bg-gradient-to-r bg-clip-text text-xs font-medium text-transparent ${gameColor}`}>
                          {club.gameId}
                        </p>
                      </div>
                    </div>

                    <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-2">
                      {truncate(club.description || '暂无简介', 60)}
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        部长: {club.ownerName}
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {club.members} 成员
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
