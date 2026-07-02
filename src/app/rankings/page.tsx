'use client';

import { Suspense } from 'react';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getGameColor } from '@/data/gameColors';

const GAMES = ['三角洲行动', '王者荣耀', '英雄联盟', '和平精英', 'CS2', '无畏契约', '金铲铲之战', '穿越火线'];

const SORT_OPTIONS = [
  { key: 'rating', label: '综合评分' },
  { key: 'orders', label: '接单量' },
  { key: 'earnings', label: '收入' },
] as const;

const CLUB_SORT_OPTIONS = [
  { key: 'memberCount', label: '成员数' },
  { key: 'newest', label: '最新创建' },
] as const;

interface CompanionRanking {
  id: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  avatar: string | null;
  rating: number;
  ratingCount: number;
  totalOrders: number;
  totalEarnings: number;
  userId: string;
  userName: string;
}

interface ClubRanking {
  id: string;
  name: string;
  gameId: string;
  avatar: string | null;
  memberCount: number;
  description: string | null;
  ownerId: string;
  ownerName: string;
}

function getInitials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'C';
}

function renderStars(rating: number) {
  const stars = [];
  const displayRating = Math.round(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={`text-sm ${i <= displayRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
        ★
      </span>,
    );
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

function getStatLabel(sort: string) {
  switch (sort) {
    case 'orders':
      return '接单量';
    case 'earnings':
      return '收入';
    case 'rating':
    default:
      return '评分';
  }
}

function getStatValue(companion: CompanionRanking, sort: string) {
  switch (sort) {
    case 'orders':
      return formatNumber(companion.totalOrders);
    case 'earnings':
      return formatCurrency(companion.totalEarnings);
    case 'rating':
    default:
      return companion.rating.toFixed(1);
  }
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('zh-CN').format(value);

function TopThreeCard({
  companion,
  medal,
  bgClass,
  borderClass,
}: {
  companion: CompanionRanking;
  medal: string;
  bgClass: string;
  borderClass: string;
}) {
  const gameColor = getGameColor(companion.game);
  return (
    <Link
      href={`/companion/${companion.id}`}
      className={`card overflow-hidden border-2 ${borderClass} ${bgClass} hover:shadow-lg transition-shadow transition-colors motion-reduce:transition-none group`}
    >
      <div className="p-5 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">{medal}</div>
        <div className="relative mx-auto mb-3">
          <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg mx-auto bg-gray-200 dark:bg-gray-700">
            {companion.avatar ? (
              <Image
                src={companion.avatar}
                alt={companion.name}
                width={80}
                height={80}
                sizes="80px"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center text-3xl font-bold text-white bg-gradient-to-r ${gameColor}`}>
                {getInitials(companion.name)}
              </div>
            )}
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors truncate">
          {companion.name}
        </h3>
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className={`rounded-full bg-gradient-to-r ${gameColor} px-2 py-0.5 text-xs font-medium text-white`}>
            {companion.game}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{companion.rank}</span>
        </div>
        <div className="mt-2 text-xl font-bold text-primary tabular-nums" suppressHydrationWarning>{formatCurrency(companion.price)}<span className="text-xs text-gray-400 font-normal">/小时</span></div>
        <div className="mt-2 flex items-center justify-center gap-1">
          {renderStars(companion.rating)}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{companion.rating.toFixed(1)}</span>
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 tabular-nums">
          累计 <span suppressHydrationWarning>{formatNumber(companion.totalOrders)}</span> 单
        </div>
      </div>
    </Link>
  );
}

function TopThreeClubCard({
  club,
  medal,
  bgClass,
  borderClass,
}: {
  club: ClubRanking;
  medal: string;
  bgClass: string;
  borderClass: string;
}) {
  const gameColor = getGameColor(club.gameId);
  return (
    <Link
      href={`/clubs/${club.id}`}
      className={`card overflow-hidden border-2 ${borderClass} ${bgClass} hover:shadow-lg transition-shadow transition-colors motion-reduce:transition-none group`}
    >
      <div className="p-5 text-center">
        <div className="text-4xl mb-3" aria-hidden="true">{medal}</div>
        <div className="relative mx-auto mb-3">
          <div className="h-20 w-20 overflow-hidden rounded-full ring-4 ring-white dark:ring-gray-800 shadow-lg mx-auto bg-gray-200 dark:bg-gray-700">
            {club.avatar ? (
              <Image
                src={club.avatar}
                alt={club.name}
                width={80}
                height={80}
                sizes="80px"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center text-3xl font-bold text-white bg-gradient-to-r ${gameColor}`}>
                {getInitials(club.name)}
              </div>
            )}
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors truncate">
          {club.name}
        </h3>
        <div className="mt-1">
          <span className={`rounded-full bg-gradient-to-r ${gameColor} px-2 py-0.5 text-xs font-medium text-white`}>
            {club.gameId}
          </span>
        </div>
        <div className="mt-2 text-xl font-bold text-primary tabular-nums" suppressHydrationWarning>{formatNumber(club.memberCount)}<span className="text-xs text-gray-400 font-normal"> 成员</span></div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {club.description || '暂无简介'}
        </p>
      </div>
    </Link>
  );
}

function RankingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="p-5 text-center">
              <div className="text-4xl mb-3 opacity-0">🥇</div>
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-3" />
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
          </div>
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center p-4 gap-4">
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingsContent() {

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<'companions' | 'clubs'>(
    (searchParams.get('tab') as 'companions' | 'clubs') || 'companions'
  );
  const [companions, setCompanions] = useState<CompanionRanking[]>([]);
  const [clubs, setClubs] = useState<ClubRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<string>(searchParams.get('sort') || 'rating');
  const [game, setGame] = useState(searchParams.get('game') || '');
  const [clubSort, setClubSort] = useState(searchParams.get('clubSort') || 'memberCount');

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const fetchCompanions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('sort', sort);
        if (game) params.set('game', game);
        params.set('limit', '20');
        const response = await fetch(`/api/rankings/companions?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setCompanions(data.companions || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    if (activeTab === 'companions') fetchCompanions();
  }, [sort, game, activeTab]);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('sort', clubSort);
        if (game) params.set('game', game);
        params.set('limit', '20');
        const response = await fetch(`/api/rankings/clubs?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setClubs(data.clubs || []);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    if (activeTab === 'clubs') fetchClubs();
  }, [game, activeTab, clubSort]);

  const handleTabChange = (tab: 'companions' | 'clubs') => {
    setActiveTab(tab);
    setGame('');
    if (tab === 'companions') setSort('rating');
    if (tab === 'clubs') setClubSort('memberCount');
    updateURL({ tab, game: '', sort: tab === 'companions' ? 'rating' : '', clubSort: tab === 'clubs' ? 'memberCount' : '' });
  };

  const top3 = companions.slice(0, 3);
  const rest = companions.slice(3);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight">排行榜</h1>
          <p className="mt-3 max-w-2xl text-white/90">查看平台最优秀的陪玩师和最活跃的俱乐部</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-3 mb-8" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'companions'}
            onClick={() => handleTabChange('companions')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-shadow transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              activeTab === 'companions'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            陪玩排行
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'clubs'}
            onClick={() => handleTabChange('clubs')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-shadow transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              activeTab === 'clubs'
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            俱乐部排行
          </button>
        </div>

        {activeTab === 'companions' && (
          <div className="card mb-8 sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/90 shadow-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setSort(opt.key); updateURL({ sort: opt.key }); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-shadow transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      sort === opt.key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto">
                <select
                  className="select cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="选择游戏"
                  value={game}
                  onChange={(e) => { setGame(e.target.value); updateURL({ game: e.target.value }); }}
                >
                  <option value="">全部游戏</option>
                  {GAMES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clubs' && (
          <div className="card mb-8 sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/90 shadow-lg">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {CLUB_SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => { setClubSort(opt.key); updateURL({ clubSort: opt.key }); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-shadow transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      clubSort === opt.key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto">
                <select
                  className="select cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="选择游戏"
                  value={game}
                  onChange={(e) => { setGame(e.target.value); updateURL({ game: e.target.value }); }}
                >
                  <option value="">全部游戏</option>
                  {GAMES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <RankingsSkeleton />
        ) : activeTab === 'companions' ? (
          companions.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4" aria-hidden="true">🏆</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">暂无排行数据</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {game ? '没有找到符合条件的陪玩师，请尝试调整筛选条件' : '暂时还没有陪玩师上榜'}
              </p>
            </div>
          ) : (
            <div>
              {top3.length >= 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <TopThreeCard
                    companion={top3[1]}
                    medal="🥈"
                    bgClass="bg-gray-50 dark:bg-gray-800/50"
                    borderClass="border-gray-300 dark:border-gray-600"
                  />
                  <TopThreeCard
                    companion={top3[0]}
                    medal="🥇"
                    bgClass="bg-yellow-50 dark:bg-yellow-900/20"
                    borderClass="border-yellow-300 dark:border-yellow-600"
                  />
                  <TopThreeCard
                    companion={top3[2]}
                    medal="🥉"
                    bgClass="bg-orange-50 dark:bg-orange-900/20"
                    borderClass="border-orange-200 dark:border-orange-700"
                  />
                </div>
              )}

              {top3.length > 0 && top3.length < 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {top3.map((c, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const bgClasses = [
                      'bg-yellow-50 dark:bg-yellow-900/20',
                      'bg-gray-50 dark:bg-gray-800/50',
                      'bg-orange-50 dark:bg-orange-900/20',
                    ];
                    const borderClasses = [
                      'border-yellow-300 dark:border-yellow-600',
                      'border-gray-300 dark:border-gray-600',
                      'border-orange-200 dark:border-orange-700',
                    ];
                    return (
                      <TopThreeCard
                        key={c.id}
                        companion={c}
                        medal={medals[i]}
                        bgClass={bgClasses[i]}
                        borderClass={borderClasses[i]}
                      />
                    );
                  })}
                </div>
              )}

              {rest.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      更多排名
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {getStatLabel(sort)}
                    </span>
                  </div>
                  {rest.map((companion, index) => {
                    const gameColor = getGameColor(companion.game);
                    return (
                      <Link
                        key={companion.id}
                        href={`/companion/${companion.id}`}
                        className="card hover:shadow-md transition-shadow transition-colors motion-reduce:transition-none flex items-center p-4 gap-4 group"
                      >
                        <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-8 text-center shrink-0">
                          {index + 4}
                        </span>
                        <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-primary/20 bg-gray-200 dark:bg-gray-700 shrink-0">
                          {companion.avatar ? (
                            <Image
                              src={companion.avatar}
                              alt={companion.name}
                              width={48}
                              height={48}
                              sizes="48px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className={`flex h-full w-full items-center justify-center text-lg font-bold text-white bg-gradient-to-r ${gameColor}`}>
                              {getInitials(companion.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                            {companion.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`rounded-full bg-gradient-to-r ${gameColor} px-2 py-0.5 text-xs font-medium text-white`}>
                              {companion.game}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{companion.rank}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 tabular-nums">
                          <span className="text-lg font-bold text-gray-800 dark:text-gray-100" suppressHydrationWarning>
                            {getStatValue(companion, sort)}
                          </span>
                          {sort === 'rating' && (
                            <div className="flex items-center justify-end gap-0.5 mt-0.5">
                              {renderStars(companion.rating)}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )
        ) : (
          clubs.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4" aria-hidden="true">🏕️</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">暂无排行数据</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {game ? '没有找到符合条件的俱乐部，请尝试调整筛选条件' : '暂时还没有俱乐部上榜'}
              </p>
            </div>
          ) : (
            <div>
              {clubs.length >= 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  <TopThreeClubCard
                    club={clubs[1]}
                    medal="🥈"
                    bgClass="bg-gray-50 dark:bg-gray-800/50"
                    borderClass="border-gray-300 dark:border-gray-600"
                  />
                  <TopThreeClubCard
                    club={clubs[0]}
                    medal="🥇"
                    bgClass="bg-yellow-50 dark:bg-yellow-900/20"
                    borderClass="border-yellow-300 dark:border-yellow-600"
                  />
                  <TopThreeClubCard
                    club={clubs[2]}
                    medal="🥉"
                    bgClass="bg-orange-50 dark:bg-orange-900/20"
                    borderClass="border-orange-200 dark:border-orange-700"
                  />
                </div>
              )}

              {clubs.length > 0 && clubs.length < 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                  {clubs.map((club, i) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const bgClasses = [
                      'bg-yellow-50 dark:bg-yellow-900/20',
                      'bg-gray-50 dark:bg-gray-800/50',
                      'bg-orange-50 dark:bg-orange-900/20',
                    ];
                    const borderClasses = [
                      'border-yellow-300 dark:border-yellow-600',
                      'border-gray-300 dark:border-gray-600',
                      'border-orange-200 dark:border-orange-700',
                    ];
                    return (
                      <TopThreeClubCard
                        key={club.id}
                        club={club}
                        medal={medals[i]}
                        bgClass={bgClasses[i]}
                        borderClass={borderClasses[i]}
                      />
                    );
                  })}
                </div>
              )}

              {clubs.length > 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      更多排名
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {clubSort === 'newest' ? '创建时间' : '成员数'}
                    </span>
                  </div>
                  {clubs.slice(3).map((club, index) => {
                    const gameColor = getGameColor(club.gameId);
                    return (
                      <Link
                        key={club.id}
                        href={`/clubs/${club.id}`}
                        className="card hover:shadow-md transition-shadow transition-colors motion-reduce:transition-none flex items-center p-4 gap-4 group"
                      >
                        <span className="text-lg font-bold text-gray-400 dark:text-gray-500 w-8 text-center shrink-0">
                          {index + 4}
                        </span>
                        <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-primary/20 bg-gray-200 dark:bg-gray-700 shrink-0">
                          {club.avatar ? (
                            <Image
                              src={club.avatar}
                              alt={club.name}
                              width={48}
                              height={48}
                              sizes="48px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className={`flex h-full w-full items-center justify-center text-lg font-bold text-white bg-gradient-to-r ${gameColor}`}>
                              {getInitials(club.name)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                            {club.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`rounded-full bg-gradient-to-r ${gameColor} px-2 py-0.5 text-xs font-medium text-white`}>
                              {club.gameId}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {club.description || '暂无简介'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 tabular-nums">
                          <span className="text-lg font-bold text-gray-800 dark:text-gray-100" suppressHydrationWarning>
                            {formatNumber(club.memberCount)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 block">成员</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}


export default function RankingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <RankingsContent />
    </Suspense>
  );
}