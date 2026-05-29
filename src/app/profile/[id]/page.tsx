'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUserStore } from '@/store/user';

interface ClubInfo {
  id: string;
  role: string;
  joinedAt: string;
  club: {
    id: string;
    name: string;
    avatar: string | null;
    gameId: string;
  };
}

interface ProfileUser {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
    friends: number;
    clubMembers: number;
  };
  clubMembers: ClubInfo[];
}

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'U';
}

function formatJoinDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月加入`;
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'companion':
      return '陪玩';
    case 'admin':
      return '管理员';
    default:
      return '用户';
  }
}

function getRoleBadgeClass(role: string) {
  switch (role) {
    case 'companion':
      return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    case 'admin':
      return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    default:
      return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
  }
}

export default function PublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { user: currentUser } = useUserStore();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendStatus, setFriendStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (active) setProfileUser(data.user);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchProfile();
    return () => { active = false; };
  }, [id]);

  const handleAddFriend = async () => {
    if (!currentUser) return;
    setFriendLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: id }),
      });
      if (res.ok) {
        setFriendStatus('sent');
      } else {
        setFriendStatus('error');
      }
    } catch {
      setFriendStatus('error');
    } finally {
      setFriendLoading(false);
    }
  };

  const isSelf = currentUser?.id === id;

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-6">
              <div className="h-28 w-28 rounded-full bg-white/20 animate-pulse" />
              <div className="space-y-3">
                <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
                <div className="h-5 w-32 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card border border-white/90 dark:border-gray-700">
                <div className="h-10 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mt-3" />
              </div>
            ))}
          </div>
          <div className="card border border-white/90 dark:border-gray-700">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profileUser) {
    return (
      <div className="min-h-screen">
        <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold">用户资料</h1>
            <p className="mt-2 opacity-90">查看用户公开信息</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="card mx-auto max-w-2xl text-center border border-white/90 dark:border-gray-700">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">用户不存在</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">该用户可能已被删除或链接无效。</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className="btn btn-primary text-center">返回首页</Link>
              <Link href="/find-companion" className="btn btn-secondary text-center">去找陪玩</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {profileUser.avatar ? (
              <div className="relative h-28 w-28 shrink-0">
                <Image
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  fill
                  className="rounded-full object-cover ring-4 ring-white/30"
                />
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/20 text-4xl font-bold ring-4 ring-white/30 shrink-0">
                {getInitials(profileUser.name)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeClass(profileUser.role)}`}>
                  {getRoleLabel(profileUser.role)}
                </span>
              </div>
              <p className="mt-2 text-white/80 text-sm">{formatJoinDate(profileUser.createdAt)}</p>
              {profileUser.bio && (
                <p className="mt-3 text-white/90 max-w-xl">{profileUser.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="card border border-white/90 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-primary">{profileUser._count.orders}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">订单数</div>
          </div>
          <div className="card border border-white/90 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{profileUser._count.friends}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">好友数</div>
          </div>
          <div className="card border border-white/90 dark:border-gray-700 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{profileUser._count.clubMembers}</div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">加入俱乐部数</div>
          </div>
        </div>

        {!isSelf && currentUser && (
          <div className="card border border-white/90 dark:border-gray-700 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleAddFriend}
                disabled={friendLoading || friendStatus === 'sent'}
                className="btn btn-primary"
              >
                {friendStatus === 'sent' ? '已发送申请' : friendLoading ? '发送中...' : '加好友'}
              </button>
              <Link
                href={`/messages?to=${id}`}
                className="btn btn-secondary text-center"
              >
                发消息
              </Link>
              {friendStatus === 'error' && (
                <span className="text-sm text-red-500 dark:text-red-400">发送失败，请稍后重试</span>
              )}
            </div>
          </div>
        )}

        {profileUser.clubMembers.length > 0 && (
          <div className="card border border-white/90 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">加入的俱乐部</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profileUser.clubMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/clubs/${member.club.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-700 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {member.club.avatar ? (
                    <div className="relative h-12 w-12 shrink-0">
                      <Image
                        src={member.club.avatar}
                        alt={member.club.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shrink-0">
                      {getInitials(member.club.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 dark:text-gray-100 truncate">{member.club.name}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{member.club.gameId}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {profileUser.clubMembers.length === 0 && (
          <div className="card border border-white/90 dark:border-gray-700 text-center py-10">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">暂未加入俱乐部</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">该用户还没有加入任何俱乐部</p>
          </div>
        )}
      </div>
    </div>
  );
}
