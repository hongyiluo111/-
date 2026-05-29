'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getGameColor, getGameGradientStyle } from '@/data/gameColors';
import { useUserStore } from '@/store/user';
import BookingModal from './BookingModal';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';
import { useInView } from '@/hooks/useInView';
import { SkeletonCard } from './Skeleton';
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
  clubId?: string;
  clubName?: string;
  type: 'platform' | 'club';
}

function FeaturedCompanionCard({ companion, index, isOnline }: { companion: Companion; index: number; isOnline: boolean }) {
  const { user } = useUserStore();
  const router = useRouter();
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
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-md border border-white/30 dark:border-gray-700/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group p-3"
        >
          <div className="h-1.5 -mx-3 -mt-3 mb-2" style={getGameGradientStyle(companion.game)} />
          <div className="absolute top-1.5 right-1.5 z-10">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              companion.type === 'platform'
                ? 'bg-blue-500/90 text-white'
                : 'bg-purple-500/90 text-white'
            }`}>
              {companion.type === 'platform' ? '鸿一电竞' : companion.clubName || '俱乐部'}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => router.push(`/companion/${companion.id}`)}>
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary ring-offset-1 bg-gray-200">
                {companion.avatar ? (
                  <Image
                    src={companion.avatar}
                    alt={companion.name}
                    width={40}
                    height={40}
                    sizes="40px"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                    {companion.name.charAt(0)}
                  </div>
                )}
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-[1.5px] border-white dark:border-gray-800 ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
                title={isOnline ? '在线' : '离线'}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-primary transition-colors truncate">{companion.name}</h3>
              <p className={`text-[11px] bg-gradient-to-r ${gameColor} bg-clip-text text-transparent font-medium truncate`}>
                {companion.game} · {companion.rank}
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2 flex-grow text-xs leading-relaxed line-clamp-2">{companion.description}</p>

          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-bold text-primary">￥{companion.price}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">/小时</span>
            </div>
            {companion.ratingCount > 0 && (
              <div className="flex items-center gap-0.5">
                <svg className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-[10px] text-gray-500">{companion.ratingCount}</span>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2.5 pt-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-b-2xl">
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => {
                  if (user) {
                    router.push('/messages?to=' + companion.userId);
                  } else {
                    alert('请先登录');
                  }
                }}
                className="px-2 py-1 text-[11px] bg-white/20 backdrop-blur-sm text-white rounded hover:bg-white/30 transition-colors"
              >
                聊天
              </button>
              <button
                onClick={() => setShowBooking(true)}
                className="px-2 py-1 text-[11px] text-white rounded hover:shadow-md transition-all"
                style={getGameGradientStyle(companion.game)}
              >
                预约
              </button>
            </div>
          </div>
        </TiltCard>
      </div>

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
        const [platformRes, clubRes] = await Promise.all([
          fetch('/api/companions'),
          fetch('/api/companions/club')
        ]);

        let allCompanions: Companion[] = [];

        if (platformRes.ok) {
          const platformData = await platformRes.json();
          const platformCompanions = (platformData.companions || []).map((c: Companion) => ({
            ...c,
            type: 'platform' as const
          }));
          allCompanions = [...allCompanions, ...platformCompanions];
        }

        if (clubRes.ok) {
          const clubData = await clubRes.json();
          const clubCompanions = (clubData.companions || []).map((c: Companion) => ({
            ...c,
            type: 'club' as const
          }));
          allCompanions = [...allCompanions, ...clubCompanions];
        }

        const seen = new Set<string>();
        const deduplicated = allCompanions.filter((c) => {
          if (seen.has(c.id)) return false;
          seen.add(c.id);
          return true;
        });
        const shuffled = deduplicated.sort(() => Math.random() - 0.5);
        setFeaturedCompanions(shuffled.slice(0, 8));
      } catch (error) {
        console.error('获取陪玩列表失败:', error);
      } finally {
        setIsReady(true);
      }
    };

    fetchCompanions();
  }, []);

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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gradient">热门陪玩</h2>
          <p className="text-gray-500 dark:text-gray-400">来自各游戏的顶尖选手，为你提供最佳游戏体验</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-gradient">热门陪玩</h2>
        <p className="text-gray-500 dark:text-gray-400">来自各游戏的顶尖选手，为你提供最佳游戏体验</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {featuredCompanions.map((companion, index) => (
          <FeaturedCompanionCard
            key={`${companion.type}-${companion.id}`}
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