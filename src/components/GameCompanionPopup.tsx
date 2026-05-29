'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGameGradientStyle } from '@/data/gameColors';
import BookingModal from './BookingModal';
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
}

interface Props {
  game: string;
  onClose: () => void;
}

export default function GameCompanionPopup({ game, onClose }: Props) {
  const router = useRouter();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [showBooking, setShowBooking] = useState<Companion | null>(null);

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const response = await fetch('/api/companions');
        if (response.ok) {
          const data = await response.json();
          const filtered = (data.companions || [])
            .filter((c: Companion) => c.game === game)
            .slice(0, 4);
          setCompanions(filtered);
        }
      } catch (error) {
        console.error('获取陪玩列表失败:', error);
      }
    };

    fetchCompanions();
  }, [game]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
        <div
          className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{game}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{companions.length} 位在线陪玩</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="关闭"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 陪玩列表 */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {companions.map((companion) => (
              <div key={companion.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30 bg-gray-200">
                    {companion.avatar ? (
                      <Image
                        src={companion.avatar}
                        alt={companion.name}
                        width={48}
                        height={48}
                        sizes="48px"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg text-gray-400">
                        {companion.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{companion.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{companion.rank}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{companion.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-primary">￥{companion.price}</span>
                  <button
                    onClick={() => router.push('/messages?to=' + companion.userId)}
                    className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                  >
                    聊天
                  </button>
                  <button
                    onClick={() => setShowBooking(companion)}
                    className="px-2.5 py-1 text-xs text-white rounded-lg transition-all hover:shadow-md"
                    style={getGameGradientStyle(game)}
                  >
                    预约
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 底部 */}
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              href={`/find-companion?game=${game}`}
              onClick={onClose}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              查看全部陪玩 →
            </Link>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal companion={showBooking} onClose={() => setShowBooking(null)} />
      )}
    </>
  );
}
