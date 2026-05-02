'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { getGameColor } from '@/data/gameColors';
import { useUserStore } from '@/store/user';
import BookingModal from './BookingModal';
import ChatModal from './ChatModal';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';

interface Companion {
  id: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string;
  avatar: string;
}

const ITEMS_PER_PAGE = 16;
const LOGIN_ALERT_DURATION = 3000;

interface CompanionListProps {
  filters?: {
    game: string;
    rank: string;
    priceRange: string;
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
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatCompanion, setChatCompanion] = useState<string | null>(null);
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
    return companions.filter((companion) => {
      if (filters?.game && companion.game !== filters.game) {
        return false;
      }

      if (filters?.rank && companion.rank !== filters.rank) {
        return false;
      }

      return matchesPriceRange(companion.price, filters?.priceRange || '');
    });
  }, [companions, filters]);

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

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold">热门陪玩</h2>
        <p className="text-gray-500">根据筛选条件展示匹配结果</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
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
                    <div className="mb-4 flex items-center">
                      <div className="relative">
                        <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2">
                          <Image
                            src={companion.avatar}
                            alt={companion.name}
                            width={64}
                            height={64}
                            sizes="64px"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
                      </div>

                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-800">{companion.name}</h3>
                        <p className={`bg-gradient-to-r bg-clip-text text-sm font-medium text-transparent ${gameColor}`}>
                          {companion.game} · {companion.rank}
                        </p>
                      </div>
                    </div>

                    <p className="mb-4 flex-grow text-sm leading-relaxed text-gray-600">{companion.description}</p>

                    <div className="flex items-center justify-between border-t border-gray-100/80 pt-3">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-primary">￥{companion.price}</span>
                        <span className="text-xs text-gray-400">/小时</span>
                      </div>

                      <div className="flex space-x-2">
                        <MagneticButton
                          onClick={() => setChatCompanion(companion.name)}
                          className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                          strength={8}
                        >
                          聊天
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

      {chatCompanion && <ChatModal companionName={chatCompanion} onClose={() => setChatCompanion(null)} />}
      {bookingCompanion && <BookingModal companion={bookingCompanion} onClose={() => setBookingCompanion(null)} />}

      {showLoginAlert && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl bg-red-500 px-6 py-3 text-white shadow-lg">
          请先登录后再操作
        </div>
      )}
    </div>
  );
}
