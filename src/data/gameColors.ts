export const gameColors: Record<string, string> = {
  '三角洲行动': 'from-green-500 to-emerald-600',
  '王者荣耀': 'from-orange-500 to-red-500',
  '英雄联盟': 'from-blue-500 to-indigo-600',
  '英雄联盟手游': 'from-blue-400 to-purple-500',
  '和平精英': 'from-yellow-500 to-orange-500',
  '无畏契约': 'from-pink-500 to-rose-600',
  '金铲铲之战': 'from-teal-500 to-cyan-600',
  '穿越火线': 'from-gray-500 to-gray-700',
  '第五人格': 'from-amber-500 to-orange-600',
  '蛋仔派对': 'from-pink-400 to-purple-500',
  '暗区突围': 'from-yellow-600 to-amber-700',
  'CS2': 'from-orange-400 to-red-500',
};

export const gameGradientStyles: Record<string, React.CSSProperties> = {
  '三角洲行动': { background: 'linear-gradient(to right, #22c55e, #059669)' },
  '王者荣耀': { background: 'linear-gradient(to right, #f97316, #ef4444)' },
  '英雄联盟': { background: 'linear-gradient(to right, #3b82f6, #4f46e5)' },
  '英雄联盟手游': { background: 'linear-gradient(to right, #60a5fa, #a855f7)' },
  '和平精英': { background: 'linear-gradient(to right, #eab308, #f97316)' },
  '无畏契约': { background: 'linear-gradient(to right, #ec4899, #e11d48)' },
  '金铲铲之战': { background: 'linear-gradient(to right, #14b8a6, #06b6d4)' },
  '穿越火线': { background: 'linear-gradient(to right, #6b7280, #374151)' },
  '第五人格': { background: 'linear-gradient(to right, #f59e0b, #ea580c)' },
  '蛋仔派对': { background: 'linear-gradient(to right, #f472b6, #a855f7)' },
  '暗区突围': { background: 'linear-gradient(to right, #ca8a04, #b45309)' },
  'CS2': { background: 'linear-gradient(to right, #fb923c, #ef4444)' },
};

export const DEFAULT_GAME_COLOR = 'from-primary to-accent';

export function getGameColor(game: string): string {
  return gameColors[game] || DEFAULT_GAME_COLOR;
}

export function getGameGradientStyle(game: string): React.CSSProperties {
  return gameGradientStyles[game] || { background: 'linear-gradient(to right, #1976d2, #0d47a1)' };
}
