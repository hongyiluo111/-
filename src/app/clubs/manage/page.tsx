'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { getGameColor } from '@/data/gameColors';

interface ClubSummary {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;
  gameId: string;
  memberCount: number;
  createdAt: string;
}

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'C';
}

export default function ClubManagePage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [clubs, setClubs] = useState<ClubSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      fetch('/api/auth/current-user')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setUser(data); })
        .catch(() => {});
    }
  }, [setUser, user]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'club_admin' && user.role !== 'admin') {
      router.push('/clubs');
      return;
    }

    fetch('/api/clubs/manage')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setClubs(data.clubs || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">请先登录</h1>
        <Link href="/login" className="btn btn-primary mt-4">去登录</Link>
      </div>
    );
  }

  if (user.role !== 'club_admin' && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6">⛔</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">无权限</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">需要俱乐部管理员权限</p>
        <Link href="/clubs" className="btn btn-primary">返回俱乐部</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">俱乐部管理</h1>
          <p className="mt-3 max-w-2xl text-white/90">管理你的俱乐部，发布公告、管理成员、编辑资料。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            我的俱乐部 ({clubs.length})
          </h2>
          <Link href="/clubs/create" className="btn btn-primary gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            创建俱乐部
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : clubs.length === 0 ? (
          <div className="empty-state py-16">
            <div className="text-5xl mb-4">🏕️</div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">暂无俱乐部</p>
            <p className="text-gray-400 dark:text-gray-500 mb-6">创建你的第一个俱乐部开始管理吧</p>
            <Link href="/clubs/create" className="btn btn-primary">创建俱乐部</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club) => {
              const gameColor = getGameColor(club.gameId);
              return (
                <div
                  key={club.id}
                  className="card interactive-card cursor-pointer group"
                  onClick={() => router.push(`/clubs/${club.id}/manage`)}
                >
                  {/* Banner */}
                  <div className={`h-24 -mx-6 -mt-6 mb-4 rounded-t-2xl bg-gradient-to-r ${gameColor} relative overflow-hidden`}>
                    {club.banner && (
                      <Image src={club.banner} alt={club.name} fill sizes="400px" className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800 shadow shrink-0`}>
                      {club.avatar ? (
                        <Image src={club.avatar} alt={club.name} width={48} height={48} sizes="48px" className="h-full w-full object-cover" />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center text-lg font-bold text-white bg-gradient-to-r ${gameColor}`}>
                          {getInitials(club.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{club.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`rounded-full px-2 py-0.5 bg-gradient-to-r ${gameColor} text-white`}>{club.gameId}</span>
                        <span>{club.memberCount} 名成员</span>
                      </div>
                    </div>
                  </div>

                  {club.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{club.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>创建于 {new Date(club.createdAt).toLocaleDateString('zh-CN')}</span>
                    <span className="text-primary group-hover:translate-x-1 transition-transform">管理 →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
