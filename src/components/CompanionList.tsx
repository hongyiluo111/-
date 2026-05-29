'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { getGameColor } from '@/data/gameColors';
import { useUserStore } from '@/store/user';
import BookingModal from './BookingModal';
import { SkeletonCard } from './Skeleton';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';
import { useRouter } from 'next/navigation';

interface Companion {
  id: string;
  userId: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string;
  avatar: string;
  rating: number;
  ratingCount: number;
  totalOrders: number;
}

const ITEMS_PER_PAGE = 16;
const LOGIN_ALERT_DURATION = 3000;

interface CompanionListProps {
  filters?: {
    game: string;
    rank: string;
    priceRange: string;
    search?: string;
    sort?: string;
  };
}

function matchesPriceRange(price: number, priceRange: string) {
  if (!priceRange) {
    return true;
  }

  if (priceRange === '200+') {
    return price >= 200;
  }

  const [min, max] = priceRange.split('-').map(Number);
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return true;
  }

  return price >= min && price <= max;
}

export default function CompanionList({ filters }: CompanionListProps) {
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [bookingCompanion, setBookingCompanion] = useState<Companion | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCardIds, setVisibleCardIds] = useState<Record<string, boolean>>({});
  const loginAlertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 从 API 获取陪玩数据
  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const response = await fetch('/api/companions');
        if (response.ok) {
          const data = await response.json();
          setCompanions(data.companions || []);
        }
      } catch (error) {
        console.error('获取陪玩列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanions();
  }, []);

  // 获取在线状态
  useEffect(() => {
    if (companions.length === 0) return;

    const fetchOnlineStatus = async () => {
      try {
        const userIds = companions.map((c) => c.userId).join(',');
        const response = await fetch(`/api/user/status?userIds=${userIds}`);
        if (response.ok) {
          const data = await response.json();
          setOnlineStatus(data.status || {});
        }
      } catch (error) {
        console.error('获取在线状态失败:', error);
      }
    };

    fetchOnlineStatus();

    // 每 30 秒更新一次在线状态
    const interval = setInterval(fetchOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, [companions]);

  // 心跳：更新当前用户的在线状态
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/user/online', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // 忽略心跳错误
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000); // 每分钟心跳
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      return;
    }

    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (!response.ok) {
          return;
        }

        const userData = await response.json();
        if (userData) {
          setUser(userData);
        }
      } catch (loadError) {
        console.error('获取用户信息失败:', loadError);
      }
    };

    loadUser();
  }, [setUser, user]);

  useEffect(() => {
    return () => {
      if (loginAlertTimeoutRef.current) {
        clearTimeout(loginAlertTimeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const filteredCompanions = useMemo(() => {
    return companions
      .filter((companion) => {
        if (filters?.game && companion.game !== filters.game) {
          return false;
        }

        if (filters?.rank && companion.rank !== filters.rank) {
          return false;
        }

        if (filters?.search && !companion.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }

        return matchesPriceRange(companion.price, filters?.priceRange || '');
      })
      .sort((a, b) => {
        if (filters?.sort === 'price_asc') return a.price - b.price;
        if (filters?.sort === 'price_desc') return b.price - a.price;
        if (filters?.sort === 'rating') return b.rating - a.rating;
        if (filters?.sort === 'orders') return b.totalOrders - a.totalOrders;
        const aOnline = onlineStatus[a.userId] ? 1 : 0;
        const bOnline = onlineStatus[b.userId] ? 1 : 0;
        return bOnline - aOnline;
      });
  }, [companions, filters, onlineStatus]);

  const totalPages = Math.ceil(filteredCompanions.length / ITEMS_PER_PAGE);

  const paginatedCompanions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanions.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredCompanions]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const cardId = entry.target.getAttribute('data-card-id');
          if (cardId) {
            setVisibleCardIds((prev) => ({ ...prev, [cardId]: true }));
          }
          observerRef.current?.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    return () => observerRef.current?.disconnect();
  }, [paginatedCompanions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showLoginPrompt = () => {
    if (loginAlertTimeoutRef.current) {
      clearTimeout(loginAlertTimeoutRef.current);
    }

    setShowLoginAlert(true);
    loginAlertTimeoutRef.current = setTimeout(() => {
      setShowLoginAlert(false);
      loginAlertTimeoutRef.current = null;
    }, LOGIN_ALERT_DURATION);
  };

  const isLoggedIn = () => !!user;

  const handleAddFriend = async (companion: Companion) => {
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ friendId: companion.userId }),
      });
      if (res.ok) {
        alert(`已向 ${companion.name} 发送好友请求`);
      } else {
        const data = await res.json();
        alert(data.error || '添加失败');
      }
    } catch {
      alert('网络错误');
    }
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold">热门陪玩</h2>
        <p className="text-gray-500">根据筛选条件展示匹配结果</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCompanions.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-lg">暂无符合条件的陪玩</p>
          <p className="mt-2 text-sm">请尝试调整筛选条件</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {paginatedCompanions.map((companion) => {
              const gameColor = getGameColor(companion.game);
              const isOnline = onlineStatus[companion.userId] || false;

              return (
                <TiltCard
                  key={companion.id}
                  maxTilt={5}
                  scale={1.015}
                  className={`card interactive-card shimmer-sweep group relative flex flex-col overflow-hidden border border-white/90 reveal-up ${
                    visibleCardIds[companion.id] ? 'is-visible' : ''
                  }`}
                  data-card-id={companion.id}
                  ref={(node: HTMLDivElement | null) => {
                    if (!node || !observerRef.current) {
                      return;
                    }
                    observerRef.current.observe(node);
                  }}
                >
                  <div className={`h-2 bg-gradient-to-r ${gameColor}`} />

                  <div className="p-5">
                    <div className="mb-4 flex items-center cursor-pointer" onClick={() => router.push(`/companion/${companion.id}`)}>
                      <div className="relative">
                        <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2 bg-gray-200">
                          {companion.avatar ? (
                            <Image
                              src={companion.avatar}
                              alt={companion.name}
                              width={64}
                              height={64}
                              sizes="64px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl text-gray-400">
                              {companion.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${
                            isOnline ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={isOnline ? '在线' : '离线'}
                        />
                      </div>

                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors">{companion.name}</h3>
                        <p className={`bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent ${gameColor}`}>
                          {companion.game} · {companion.rank}
                        </p>
                      </div>
                    </div>

                    <p className="mb-3 flex-grow text-sm leading-relaxed text-gray-600">{companion.description}</p>

                    {companion.ratingCount > 0 && (
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`h-4 w-4 ${star <= Math.round(companion.rating / companion.ratingCount) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{companion.ratingCount}条评价</span>
                        {companion.totalOrders > 0 && (
                          <span className="text-xs text-gray-400">· {companion.totalOrders}单</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-gray-100/80 pt-3">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-primary">￥{companion.price}</span>
                        <span className="text-xs text-gray-400">/小时</span>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 pt-8 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-b-2xl">
                      <div className="flex justify-end space-x-2">
                        <MagneticButton
                          onClick={() => {
                            if (isLoggedIn()) {
                              router.push('/messages?to=' + companion.userId);
                              return;
                            }
                            showLoginPrompt();
                          }}
                          className="rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/30"
                          strength={8}
                        >
                          聊天
                        </MagneticButton>
                        <MagneticButton
                          onClick={() => {
                            if (isLoggedIn()) {
                              handleAddFriend(companion);
                              return;
                            }
                            showLoginPrompt();
                          }}
                          className="rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
                          strength={8}
                        >
                          好友
                        </MagneticButton>
                        <MagneticButton
                          onClick={() => {
                            if (isLoggedIn()) {
                              setBookingCompanion(companion);
                              return;
                            }
                            showLoginPrompt();
                          }}
                          className={`rounded-xl bg-gradient-to-r px-3 py-1.5 text-sm text-white transition-all hover:shadow-md ${gameColor}`}
                          strength={8}
                        >
                          预约
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl bg-white px-4 py-2 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                上一页
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`rounded-xl px-4 py-2 transition-colors ${
                    currentPage === page ? 'bg-primary text-white shadow-md' : 'bg-white hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl bg-white px-4 py-2 shadow-sm transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {bookingCompanion && <BookingModal companion={bookingCompanion} onClose={() => setBookingCompanion(null)} />}

      {showLoginAlert && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-red-500 px-6 py-3 text-white shadow-lg">
          请先登录后再操作
        </div>
      )}
    </div>
  );
}
