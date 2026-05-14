'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getGameColor, getGameGradientStyle } from '@/data/gameColors';
import { useUserStore } from '@/store/user';
import BookingModal from './BookingModal';
import ChatModal from './ChatModal';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';
import { useInView } from '@/hooks/useInView';
import { SkeletonCard } from './Skeleton';

interface Companion {
  id: string;
  userId: string;
  name: string;
  game: string;
  rank: string;
  price: number;
  description: string;
  avatar: string;
}

function FeaturedCompanionCard({ companion, index, isOnline }: { companion: Companion; index: number; isOnline: boolean }) {
  const { user } = useUserStore();
  const [showChat, setShowChat] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const gameColor = getGameColor(companion.game);
  const { ref, isVisible } = useInView(0.1);

  return (
    <>
      <div
        ref={ref}
        className={`reveal-up ${isVisible ? 'is-visible' : ''}`}
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        <TiltCard
          maxTilt={5}
          scale={1.015}
          className="card card-shimmer hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
        >
          <div className="h-2 -mx-6 -mt-6 mb-4" style={getGameGradientStyle(companion.game)} />
          <div className="flex items-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2 bg-gray-200">
                {companion.avatar ? (
                  <Image
                    src={companion.avatar}
                    alt={companion.name}
                    width={64}
                    height={64}
                    sizes="64px"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                    {companion.name.charAt(0)}
                  </div>
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isOnline ? '在线' : '离线'}
              />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{companion.name}</h3>
              <p className={`text-sm bg-gradient-to-r ${gameColor} bg-clip-text text-transparent font-medium`}>
                {companion.game} · {companion.rank}
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow text-sm leading-relaxed">{companion.description}</p>
          <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">￥{companion.price}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">/小时</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 pt-8 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-b-2xl">
            <div className="flex justify-end space-x-2">
              <MagneticButton
                onClick={() => {
                  if (user) {
                    setShowChat(true);
                  } else {
                    alert('请先登录');
                  }
                }}
                className="px-3 py-1.5 text-sm bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                strength={8}
              >
                聊天
              </MagneticButton>
              <MagneticButton
                onClick={() => setShowBooking(true)}
                className="px-3 py-1.5 text-sm text-white rounded-lg hover:shadow-md transition-all"
                strength={8}
                style={getGameGradientStyle(companion.game)}
              >
                预约
              </MagneticButton>
            </div>
          </div>
        </TiltCard>
      </div>

      {showChat && (
        <ChatModal
          receiverId={companion.userId}
          receiverName={companion.name}
          onClose={() => setShowChat(false)}
        />
      )}

      {showBooking && (
        <BookingModal companion={companion} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
}

export default function FeaturedCompanions() {
  const [featuredCompanions, setFeaturedCompanions] = useState<Companion[]>([]);
  const [onlineStatus, setOnlineStatus] = useState<Record<string, boolean>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const response = await fetch('/api/companions');
        if (response.ok) {
          const data = await response.json();
          const shuffled = (data.companions || []).sort(() => Math.random() - 0.5);
          setFeaturedCompanions(shuffled.slice(0, 8));
        }
      } catch (error) {
        console.error('获取陪玩列表失败:', error);
      } finally {
        setIsReady(true);
      }
    };

    fetchCompanions();
  }, []);

  // 获取在线状态
  useEffect(() => {
    if (featuredCompanions.length === 0) return;

    const fetchOnlineStatus = async () => {
      try {
        const userIds = featuredCompanions.map((c) => c.userId).join(',');
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
    const interval = setInterval(fetchOnlineStatus, 30000);
    return () => clearInterval(interval);
  }, [featuredCompanions]);

  if (!isReady) {
    return (
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3 text-gradient">热门陪玩</h2>
          <p className="text-gray-500 dark:text-gray-400">来自各游戏的顶尖选手，为你提供最佳游戏体验</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3 text-gradient">热门陪玩</h2>
        <p className="text-gray-500 dark:text-gray-400">来自各游戏的顶尖选手，为你提供最佳游戏体验</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredCompanions.map((companion, index) => (
          <FeaturedCompanionCard
            key={companion.id}
            companion={companion}
            index={index}
            isOnline={onlineStatus[companion.userId] || false}
          />
        ))}
      </div>
      <div className="mt-12 text-center">
        <MagneticButton
          as="a"
          href="/find-companion"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 dark:from-blue-500 dark:to-blue-700"
          strength={14}
        >
          查看更多陪玩
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </MagneticButton>
      </div>
    </div>
  );
}
