'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import TiltCard from './TiltCard';
import CountUp from './CountUp';
import { useInView } from '@/hooks/useInView';
import { gameIcons } from './GameIcons';

const defaultGames = [
  { id: 1, name: '三角洲行动', companions: 0 },
  { id: 2, name: '王者荣耀', companions: 0 },
  { id: 3, name: '英雄联盟', companions: 0 },
  { id: 4, name: '和平精英', companions: 0 },
  { id: 5, name: 'CS2', companions: 0 },
  { id: 6, name: '无畏契约', companions: 0 },
  { id: 7, name: '穿越火线', companions: 0 },
  { id: 8, name: '金铲铲之战', companions: 0 },
];

export default function GameList() {
  const { ref: sectionRef, isVisible } = useInView(0.1);
  const [games, setGames] = useState(defaultGames);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/companions/count');
        if (response.ok) {
          const data = await response.json();
          setGames((prev) =>
            prev.map((game) => ({
              ...game,
              companions: data.counts[game.name] || 0,
            }))
          );
        }
      } catch (error) {
        console.error('获取陪玩数量失败:', error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div ref={sectionRef} className="mb-20 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">热门游戏</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            选择你喜欢的游戏，找到专业的陪玩伙伴
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <div
              key={game.id}
              className={`reveal-up ${isVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <TiltCard
                maxTilt={5}
                scale={1.015}
                className="card card-shimmer hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <Link
                  href={`/find-companion?game=${game.name}`}
                  className="block"
                >
                  <div className="aspect-square overflow-hidden rounded-xl mb-4 relative">
                    <Image
                      src={gameIcons[game.name]}
                      alt={game.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading={index < 4 ? 'eager' : 'lazy'}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                          <CountUp end={game.companions} /> 位陪玩
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors dark:text-gray-100">{game.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      <CountUp end={game.companions} /> 位陪玩
                    </p>
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
