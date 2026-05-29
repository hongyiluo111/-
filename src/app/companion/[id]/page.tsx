'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUserStore } from '@/store/user';
import BookingModal from '@/components/BookingModal';
import { getGameColor } from '@/data/gameColors';

interface CompanionData {
  id: string;
  userId?: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string | null;
  avatar: string | null;
  totalOrders: number;
  totalEarnings: number;
  rating: number;
  ratingCount: number;
  isOnline: boolean;
  createdAt: string;
  userName: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  content: string | null;
  createdAt: string;
}

interface ClubMembership {
  id: string;
  role: string;
  joinedAt: string;
  club: {
    id: string;
    name: string;
    avatar: string | null;
    gameId: string | null;
  };
}

const SKILL_DIMENSIONS = ['游戏熟练度', '服务态度', '响应速度', '沟通能力', '专业水平', '性价比'];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSkillScores(rating: number, ratingCount: number): number[] {
  const base = ratingCount > 0 ? (rating / ratingCount) * 20 : 80;
  const rng = seededRandom(Math.round(base * 100) + ratingCount);
  return SKILL_DIMENSIONS.map(() => {
    const variance = (rng() - 0.5) * 20;
    return Math.min(100, Math.max(40, Math.round(base + variance)));
  });
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`text-sm ${i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
        ★
      </span>
    );
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-64 bg-gradient-to-r from-primary to-accent animate-pulse" />
      <div className="container mx-auto max-w-4xl px-4 -mt-20">
        <div className="card animate-pulse">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="h-28 w-28 rounded-full bg-gray-300 dark:bg-gray-600 ring-4 ring-white dark:ring-gray-800" />
            <div className="mt-4 h-7 w-32 bg-gray-300 dark:bg-gray-600 rounded" />
            <div className="mt-2 h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-gray-100 dark:bg-gray-700 p-4 text-center">
                <div className="h-8 w-16 mx-auto bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                <div className="h-4 w-12 mx-auto bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
          <div className="space-y-3 mb-6">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="space-y-4">
            {SKILL_DIMENSIONS.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanionPublicPage() {
  const params = useParams();
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [companion, setCompanion] = useState<CompanionData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clubMemberships, setClubMemberships] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendSent, setFriendSent] = useState(false);

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

  useEffect(() => {
    const fetchCompanion = async () => {
      try {
        const response = await fetch(`/api/companions/${id}/public`);
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) throw new Error('获取信息失败');
        const data = await response.json();
        setCompanion(data.companion);
        setReviews(data.reviews || []);
        setClubMemberships(data.clubMemberships || []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanion();
  }, [id]);

  const isLoggedIn = () => !!user;

  const handleBooking = () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    setShowBookingModal(true);
  };

  const handleChat = () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    if (companion?.userId) {
      router.push(`/messages?to=${companion.userId}`);
    }
  };

  const handleAddFriend = async () => {
    if (!isLoggedIn()) {
      setShowLoginAlert(true);
      setTimeout(() => setShowLoginAlert(false), 3000);
      return;
    }
    if (!companion?.userId) return;
    setFriendLoading(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId: companion.userId }),
      });
      if (res.ok) {
        setFriendSent(true);
      } else {
        const data = await res.json();
        alert(data.error || '添加失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setFriendLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (notFound || !companion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-7xl mb-6">😿</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">陪玩不存在</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">该陪玩可能已下架或不存在</p>
        <Link
          href="/find-companion"
          className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 font-medium text-white transition-all hover:shadow-lg"
        >
          浏览其他陪玩
        </Link>
      </div>
    );
  }

  const gameColor = getGameColor(companion.game);
  const averageRating = companion.ratingCount > 0 ? companion.rating / companion.ratingCount : 5;
  const positiveRate = companion.ratingCount > 0 ? Math.round((companion.rating / companion.ratingCount) * 100) : 100;
  const skillScores = generateSkillScores(companion.rating, companion.ratingCount);

  return (
    <div className="min-h-screen flex flex-col">
      <div className={`relative bg-gradient-to-r ${gameColor} py-16 px-4`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative mx-auto max-w-4xl text-center text-white">
          <p className="text-sm opacity-80">{companion.game} · {companion.rank}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-20 pb-16">
        <div className="card relative overflow-visible">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <div className="relative">
              <div className={`h-28 w-28 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg bg-gray-200 dark:bg-gray-700`}>
                {companion.avatar ? (
                  <Image
                    src={companion.avatar}
                    alt={companion.name}
                    width={112}
                    height={112}
                    sizes="112px"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center text-4xl font-bold text-white bg-gradient-to-r ${gameColor}`}>
                    {companion.name.charAt(0)}
                  </div>
                )}
              </div>
              <div
                className={`absolute bottom-1 right-1 h-6 w-6 rounded-full border-3 border-white dark:border-gray-800 ${
                  companion.isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={companion.isOnline ? '在线' : '离线'}
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">{companion.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className={`rounded-full bg-gradient-to-r ${gameColor} px-3 py-0.5 text-xs font-medium text-white`}>
                {companion.game}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{companion.rank}</span>
              <span className={`flex items-center gap-1 text-xs ${companion.isOnline ? 'text-green-500' : 'text-red-500'}`}>
                <span className={`h-2 w-2 rounded-full ${companion.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                {companion.isOnline ? '在线' : '离线'}
              </span>
            </div>

            <div className="mt-4 text-center">
              <span className={`text-4xl font-bold bg-gradient-to-r ${gameColor} bg-clip-text text-transparent`}>
                ￥{companion.price}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">/小时</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{companion.totalOrders}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">累计接单</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{averageRating.toFixed(1)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">评分</div>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 text-center">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{positiveRate}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">好评率</div>
            </div>
          </div>

          {companion.description && (
            <div className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">个人介绍</h2>
              <p className="leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{companion.description}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">能力评估</h2>
            <div className="space-y-3">
              {SKILL_DIMENSIONS.map((skill, index) => (
                <div key={skill} className="flex items-center gap-3">
                  <span className="w-20 flex-shrink-0 text-sm text-gray-600 dark:text-gray-400">{skill}</span>
                  <div className="flex-1 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gameColor} transition-all duration-1000`}
                      style={{ width: `${skillScores[index]}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{skillScores[index]}</span>
                </div>
              ))}
            </div>
          </div>

          {clubMemberships.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">所属俱乐部</h2>
              <div className="flex flex-wrap gap-3">
                {clubMemberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 px-4 py-2"
                  >
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                      {membership.club.avatar ? (
                        <Image
                          src={membership.club.avatar}
                          alt={membership.club.name}
                          width={32}
                          height={32}
                          sizes="32px"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          {membership.club.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{membership.club.name}</span>
                    {membership.role === 'owner' && (
                      <span className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">部</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">用户评价</h2>
            {reviews.length === 0 ? (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-8 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-gray-500 dark:text-gray-400">暂无评价</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{review.userName}</p>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.content && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{review.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 z-10">
            <button
              onClick={handleBooking}
              className={`flex-1 rounded-xl bg-gradient-to-r ${gameColor} py-3.5 font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]`}
            >
              预约 ￥{companion.price}/小时
            </button>
            <button
              onClick={handleChat}
              className="flex-1 rounded-xl border-2 border-primary bg-white dark:bg-gray-800 py-3.5 font-medium text-primary transition-all hover:bg-primary/5 active:scale-[0.98]"
            >
              聊天
            </button>
            <button
              onClick={handleAddFriend}
              disabled={friendLoading || friendSent}
              className="flex-1 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 py-3.5 font-medium text-gray-700 dark:text-gray-200 transition-all hover:border-primary hover:text-primary active:scale-[0.98] disabled:opacity-50"
            >
              {friendSent ? '已发送' : friendLoading ? '发送中...' : '加好友'}
            </button>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          companion={{
            id: companion.id,
            name: companion.name,
            game: companion.game,
            rank: companion.rank,
            price: companion.price,
            description: companion.description || '',
            avatar: companion.avatar || '',
          }}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showLoginAlert && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-red-500 px-6 py-3 text-white shadow-lg">
          请先登录后再操作
        </div>
      )}
    </div>
  );
}