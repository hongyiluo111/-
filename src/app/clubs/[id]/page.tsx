'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUserStore } from '@/store/user';
import { getGameColor } from '@/data/gameColors';

interface MemberUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: MemberUser;
}

interface ClubOwner {
  id: string;
  name: string;
  avatar: string | null;
}

interface ClubData {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;
  gameId: string;
  ownerId: string;
  memberCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  owner: ClubOwner;
  members: ClubMember[];
}

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'C';
}

const roleLabels: Record<string, string> = {
  owner: '部长',
  admin: '管理员',
  member: '成员',
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-56 bg-gradient-to-r from-primary to-accent animate-pulse" />
      <div className="container mx-auto max-w-4xl px-4 -mt-20">
        <div className="card animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-24 w-24 rounded-full bg-gray-300 dark:bg-gray-600 ring-4 ring-white dark:ring-gray-800" />
            <div className="space-y-3 flex-1">
              <div className="h-7 w-48 bg-gray-300 dark:bg-gray-600 rounded" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-gray-100 dark:bg-gray-700 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
                  <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const id = params.id as string;

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

  const fetchClub = async () => {
    try {
      const response = await fetch(`/api/clubs/${id}`);
      if (response.status === 404) {
        setNotFound(true);
        return;
      }
      if (!response.ok) throw new Error('获取信息失败');
      const data = await response.json();
      setClub(data.club);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [id]);

  const handleDissolve = async () => {
    if (!window.confirm('确定要解散该俱乐部吗？此操作不可撤销。')) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/clubs/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '解散失败');
        return;
      }
      router.push('/clubs');
    } catch {
      alert('网络错误');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/clubs/${id}/leave`, { method: 'POST' });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '退出失败');
        return;
      }
      fetchClub();
    } catch {
      alert('网络错误');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/clubs/${id}/join`, { method: 'POST' });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || '加入失败');
        return;
      }
      fetchClub();
    } catch {
      alert('网络错误');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (notFound || !club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6">🏕️</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">俱乐部不存在</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">该俱乐部可能已被解散或不存在</p>
        <Link
          href="/clubs"
          className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
        >
          返回俱乐部列表
        </Link>
      </div>
    );
  }

  const gameColor = getGameColor(club.gameId);
  const isOwner = user?.id === club.ownerId;
  const isMember = club.members.some((m) => m.userId === user?.id);

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`relative h-56 bg-gradient-to-r ${gameColor}`}>
        {club.banner && (
          <Image
            src={club.banner}
            alt={club.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-20 pb-16">
        <div className="card relative overflow-visible">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
            <div className={`h-24 w-24 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg bg-gray-200 dark:bg-gray-700 shrink-0`}>
              {club.avatar ? (
                <Image
                  src={club.avatar}
                  alt={club.name}
                  width={96}
                  height={96}
                  sizes="96px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center text-3xl font-bold text-white bg-gradient-to-r ${gameColor}`}>
                  {getInitials(club.name)}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{club.name}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`rounded-full bg-gradient-to-r ${gameColor} px-3 py-0.5 text-xs font-medium text-white`}>
                  {club.gameId}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {club.memberCount} 名成员
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>部长:</span>
            <Link href={`/profile/${club.ownerId}`} className="inline-flex items-center gap-2 hover:text-primary transition-colors">
              <div className="h-6 w-6 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                {club.owner.avatar ? (
                  <Image
                    src={club.owner.avatar}
                    alt={club.owner.name}
                    width={24}
                    height={24}
                    sizes="24px"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-xs font-bold text-white bg-gradient-to-r ${gameColor}`}>
                    {getInitials(club.owner.name)}
                  </div>
                )}
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-200">{club.owner.name}</span>
            </Link>
          </div>

          {club.description && (
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">俱乐部简介</h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{club.description}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
              成员列表 ({club.members.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {club.members.map((member) => (
                <Link
                  key={member.id}
                  href={`/profile/${member.userId}`}
                  className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600 shrink-0">
                    {member.user.avatar ? (
                      <Image
                        src={member.user.avatar}
                        alt={member.user.name}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center text-sm font-bold text-white bg-gradient-to-r ${gameColor}`}>
                        {getInitials(member.user.name)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                      {member.user.name}
                    </p>
                    <span
                      className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                        member.role === 'owner'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : member.role === 'admin'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {roleLabels[member.role] || '成员'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            {!user ? (
              <div className="flex justify-center">
                <Link href="/login" className="btn btn-primary">
                  登录后加入
                </Link>
              </div>
            ) : isOwner ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/clubs/${club.id}/edit`} className="btn btn-primary text-center flex-1">
                  编辑
                </Link>
                <button
                  onClick={handleDissolve}
                  disabled={actionLoading}
                  className="btn btn-secondary flex-1"
                >
                  {actionLoading ? '处理中...' : '解散'}
                </button>
              </div>
            ) : isMember ? (
              <div className="flex justify-center">
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="btn btn-secondary"
                >
                  {actionLoading ? '处理中...' : '退出俱乐部'}
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  {actionLoading ? '处理中...' : '加入俱乐部'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
