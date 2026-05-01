'use client';

import { useState, useMemo, type MouseEvent } from 'react';
import MagneticButton from './MagneticButton';
import GameCompanionPopup from './GameCompanionPopup';

function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 13) % 100}%`,
        size: 2 + ((i * 7 + 3) % 4),
        duration: 6 + ((i * 11 + 5) % 9),
        delay: (i * 13 + 2) % 7,
      })),
    [],
  );

  return (
    <div className="hero-particles" suppressHydrationWarning>
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

const heroGames = [
  '三角洲行动', '王者荣耀', '英雄联盟', '和平精英',
  'CS2', 'VALORANT', '穿越火线', '金铲铲之战'
];

export default function Hero() {
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    setPointerOffset({ x, y });
  };

  const resetPointer = () => setPointerOffset({ x: 0, y: 0 });

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white px-4 py-24" onMouseMove={handlePointerMove} onMouseLeave={resetPointer}>
      <Particles />
      <div className="noise-overlay" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-200/15 blur-3xl"></div>
          <div className="absolute top-1/2 right-1/3 h-48 w-48 rounded-full bg-indigo-100/15 blur-3xl"></div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="mb-4 text-4xl font-bold leading-tight animate-fade-in md:text-5xl lg:text-6xl text-gradient-hero">
              专业电竞陪玩平台
            </h1>
            <p className="mb-8 max-w-xl text-xl opacity-90 animate-fade-in-delay">
              连接游戏高手与玩家，提供高质量的陪玩服务
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay-2">
              <MagneticButton
                as="a"
                href="/find-companion"
                className="btn btn-primary text-center transform hover:scale-105"
                strength={14}
              >
                找陪玩
              </MagneticButton>
              <MagneticButton
                as="a"
                href="/become-companion"
                className="btn border-white/70 bg-white text-primary text-center transform hover:scale-105 hover:bg-white/90"
                strength={14}
              >
                成为陪玩
              </MagneticButton>
              <MagneticButton
                as="a"
                href="/电竞与陪玩行业全面白皮书（2021-2025）.pdf"
                className="btn border border-white/70 text-center text-white transform hover:scale-105 hover:bg-white/10"
                strength={14}
              >
                了解电竞行业发展
              </MagneticButton>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="rounded-3xl border border-white/30 bg-white/10 p-8 shadow-2xl backdrop-blur-xl transform transition-all duration-500 hover:scale-[1.02]">
              <h2 className="text-2xl font-bold mb-6">热门游戏</h2>
              <div className="grid grid-cols-2 gap-4">
                {heroGames.map((game, index) => (
                  <button
                    key={game}
                    onClick={() => setSelectedGame(game)}
                    className="bg-white/20 rounded-lg p-4 text-center hover:bg-white/30 transition-all transform hover:scale-105 hover:shadow-lg cursor-pointer animate-float"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {game}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="pointer-events-none absolute -right-8 -top-8 hidden rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur md:block animate-float"
              style={{ transform: `translate(${pointerOffset.x * 0.25}px, ${pointerOffset.y * 0.25}px)` }}
            >
              实时匹配中
            </div>
            <div
              className="pointer-events-none absolute -left-6 bottom-0 hidden rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur md:block animate-float-delay"
              style={{ transform: `translate(${pointerOffset.x * -0.2}px, ${pointerOffset.y * -0.2}px)` }}
            >
              高分陪玩在线
            </div>
          </div>
        </div>
      </div>

      {selectedGame && (
        <GameCompanionPopup game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  );
}
