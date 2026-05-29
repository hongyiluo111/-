'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGameColor } from '@/data/gameColors';
import { useInView } from '@/hooks/useInView';
import { SkeletonCard } from './Skeleton';

interface Club {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  gameId: string;
  members: number;
}

export default function FeaturedClubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isReady, setIsReady] = useState(false);
  const { ref, isVisible } = useInView(0.1);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch('/api/clubs?sort=members&limit=6');
        if (res.ok) {
          const data = await res.json();
          setClubs(data.clubs || []);
        }
      } catch {} finally {
        setIsReady(true);
      }
    };
    fetchClubs();
  }, []);

  return (
    <section ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''} my-16`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 text-gradient">热门俱乐部</h2>
        <p className="text-gray-500 dark:text-gray-400">加入志同道合的战队</p>
      </div>

      {!isReady ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">暂无俱乐部</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-center mb-3">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getGameColor(club.gameId)} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                  {club.avatar ? (
                    <Image src={club.avatar} alt={club.name} width={56} height={56} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    club.name.charAt(0)
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                    {club.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {club.gameId}
                  </span>
                </div>
              </div>
              {club.description && (
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {club.description.length > 60 ? club.description.slice(0, 60) + '...' : club.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {club.members} 成员
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/clubs"
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
        >
          查看更多
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
