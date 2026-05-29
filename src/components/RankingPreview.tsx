'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGameColor } from '@/data/gameColors';
import { useInView } from '@/hooks/useInView';

interface RankedCompanion {
  id: string;
  name: string;
  game: string;
  avatar: string;
  rating: number;
  ratingCount: number;
}

const rankColors = [
  'bg-yellow-400 text-white',
  'bg-gray-400 text-white',
  'bg-orange-400 text-white',
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function RankingPreview() {
  const [companions, setCompanions] = useState<RankedCompanion[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { ref, isVisible } = useInView(0.1);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch('/api/rankings/companions?limit=5&sort=rating');
        if (res.ok) {
          const data = await res.json();
          setCompanions(data.companions || []);
        }
      } catch {} finally {
        setIsReady(true);
      }
    };
    fetchRankings();
  }, []);

  return (
    <section ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''} my-16`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 text-gradient">陪玩排行</h2>
        <p className="text-gray-500 dark:text-gray-400">最受欢迎的陪玩师</p>
      </div>

      <div className="card overflow-hidden">
        {!isReady ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 px-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        ) : companions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">暂无排行数据</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {companions.map((companion, index) => (
              <Link
                key={companion.id}
                href={`/companions/${companion.id}`}
                className="flex items-center gap-4 py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  index < 3 ? rankColors[index] : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-offset-2 ring-gray-200 dark:ring-gray-700 bg-gray-200 shrink-0">
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
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 dark:text-gray-100 truncate">
                    {companion.name}
                  </h4>
                  <span className={`text-xs font-medium bg-gradient-to-r ${getGameColor(companion.game)} bg-clip-text text-transparent`}>
                    {companion.game}
                  </span>
                </div>
                <div className="shrink-0">
                  <StarRating rating={companion.rating} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/rankings"
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
        >
          查看完整排行
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
