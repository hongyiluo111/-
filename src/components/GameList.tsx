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
    <div ref={sectionRef} className="mb-6 py-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gradient">热门游戏</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm">
            选择你喜欢的游戏，找到专业的陪玩伙伴
          </p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2">
          {games.map((game, index) => (
            <div
              key={game.id}
              className={`reveal-up ${isVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <TiltCard
                maxTilt={5}
                scale={1.015}
                className="card card-shimmer hover:shadow-xl transition-all duration-300 overflow-hidden group p-1.5"
              >
                <Link
                  href={`/find-companion?game=${game.name}`}
                  className="block"
                >
                  <div className="aspect-square overflow-hidden rounded mb-1.5 relative">
                    {gameIcons[game.name] ? (
                      <Image
                        src={gameIcons[game.name]}
                        alt={game.name}
                        fill
                        sizes="(max-width: 640px) 25vw, (max-width: 1024px) 12.5vw, 10vw"
                        loading={index < 8 ? 'eager' : 'lazy'}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-bold text-primary/60">
                        {game.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-[10px] font-medium group-hover:text-primary transition-colors dark:text-gray-100 truncate leading-tight">{game.name}</h3>
                </Link>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
