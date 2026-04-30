'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { allCompanions, type Companion } from '@/data/companions';
import { useUserStore } from '@/store/user';
import BookingModal from './BookingModal';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';

const gameColors: Record<string, string> = {
  三角洲行动: 'from-green-500 to-emerald-600',
  王者荣耀: 'from-orange-500 to-red-500',
  英雄联盟: 'from-blue-500 to-indigo-600',
  英雄联盟手游: 'from-blue-400 to-purple-500',
  和平精英: 'from-yellow-500 to-orange-500',
  VALORANT: 'from-pink-500 to-rose-600',
  金铲铲之战: 'from-teal-500 to-cyan-600',
  穿越火线: 'from-gray-500 to-gray-700',
  第五人格: 'from-amber-500 to-orange-600',
  蛋仔派对: 'from-pink-400 to-purple-500',
  暗区突围: 'from-yellow-600 to-amber-700',
  CS2: 'from-orange-400 to-red-500',
};

const DEFAULT_GAME_COLOR = 'from-primary to-accent';
const ITEMS_PER_PAGE = 16;
const LOGIN_ALERT_DURATION = 3000;

interface ChatModalProps {
  companionName: string;
  onClose: () => void;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface CompanionListProps {
  filters?: {
    game: string;
    rank: string;
    priceRange: string;
  };
}

function ChatModal({ companionName, onClose }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/chat/messages?companionName=${encodeURIComponent(companionName)}`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setChatHistory(data.messages || []);
      } catch (loadError) {
        console.error('加载聊天记录失败:', loadError);
      }
    };

    loadHistory();
  }, [companionName]);

  const saveMessage = async (role: string, content: string) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionName, role, content }),
      });
    } catch (saveError) {
      console.error('保存消息失败:', saveError);
    }
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedMessage,
      timestamp: Date.now(),
    };
    const nextHistory = [...chatHistory, userMessage];

    setChatHistory(nextHistory);
    setMessage('');
    setError('');

    await saveMessage('user', trimmedMessage);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map(({ role, content }) => ({ role, content })),
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || '发送消息失败，请稍后重试');
        return;
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || '抱歉，我暂时无法理解你的问题。',
        timestamp: Date.now(),
      };
      const updatedHistory = [...nextHistory, assistantMessage];

      setChatHistory(updatedHistory);
      await saveMessage('assistant', assistantMessage.content);
    } catch (requestError) {
      console.error('发送消息失败:', requestError);
      setError('网络错误，请检查网络连接');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex h-[500px] w-96 flex-col rounded-lg bg-white">
        <div className="flex items-center justify-between rounded-t-lg bg-blue-600 p-4 text-white">
          <h3 className="font-semibold">与 {companionName} 聊天</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            ×
          </button>
        </div>

        <div className="flex-grow space-y-4 overflow-y-auto p-4">
          {chatHistory.length === 0 && <p className="text-center text-sm text-gray-500">开始和 {companionName} 聊天吧！</p>}

          {chatHistory.map((msg, index) => (
            <div key={`${msg.timestamp}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {error && <div className="rounded bg-red-50 p-2 text-center text-sm text-red-500">{error}</div>}
        </div>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void handleSend();
                }
              }}
              placeholder={`给 ${companionName} 发消息...`}
              className="flex-grow rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSend} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [chatCompanion, setChatCompanion] = useState<string | null>(null);
  const [bookingCompanion, setBookingCompanion] = useState<Companion | null>(null);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCardIds, setVisibleCardIds] = useState<Record<number, boolean>>({});
  const loginAlertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
          const cardId = Number(entry.target.getAttribute('data-card-id'));
          if (!Number.isNaN(cardId)) {
            setVisibleCardIds((prev) => ({ ...prev, [cardId]: true }));
          }
          observerRef.current?.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    return () => observerRef.current?.disconnect();
  }, [paginatedCompanions]);

  const filteredCompanions = useMemo(() => {
    return allCompanions.filter((companion) => {
      if (filters?.game && companion.game !== filters.game) {
        return false;
      }

      if (filters?.rank && companion.rank !== filters.rank) {
        return false;
      }

      return matchesPriceRange(companion.price, filters?.priceRange || '');
    });
  }, [filters]);

  const totalPages = Math.ceil(filteredCompanions.length / ITEMS_PER_PAGE);

  const paginatedCompanions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCompanions.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredCompanions]);

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

  const isLoggedIn = () => {
    if (user) {
      return true;
    }

    if (typeof document === 'undefined') {
      return false;
    }

    return document.cookie.includes('token=');
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold">热门陪玩</h2>
        <p className="text-gray-500">根据筛选条件展示匹配结果</p>
      </div>

      {filteredCompanions.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-lg">暂无符合条件的陪玩</p>
          <p className="mt-2 text-sm">请尝试调整筛选条件</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {paginatedCompanions.map((companion) => {
              const gameColor = gameColors[companion.game] || DEFAULT_GAME_COLOR;

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
                          className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 magnetic-btn"
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
                          className={`rounded-xl bg-gradient-to-r px-3 py-1.5 text-sm text-white transition-all hover:shadow-md magnetic-btn ${gameColor}`}
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
