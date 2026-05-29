'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface FilterBarProps {
  onFilterChange: (filters: { game: string; rank: string; priceRange: string; search: string; sort: string }) => void;
  initialGame?: string;
}

const GAME_RANKS: Record<string, string[]> = {
  三角洲行动: ['新兵', '老兵', '精英', '高手', '专家', '大师', '三角洲巅峰'],
  王者荣耀: ['倔强青铜', '秩序白银', '荣耀黄金', '尊贵铂金', '永恒钻石', '至尊星耀', '最强王者', '无双王者', '荣耀王者', '传奇王者'],
  英雄联盟: ['坚韧黑铁', '英勇黄铜', '不屈白银', '荣耀黄金', '华贵铂金', '璀璨钻石', '超凡大师', '傲世宗师', '最强王者'],
  英雄联盟手游: ['黑铁', '黄铜', '白银', '黄金', '铂金', '流光翡翠', '钻石', '大师', '宗师', '王者'],
  和平精英: ['热血青铜', '不屈白银', '英勇黄金', '坚韧铂金', '不朽星钻', '荣耀皇冠', '超级王牌', '无敌战神'],
  无畏契约: ['黑铁', '青铜', '白银', '黄金', '铂金', '钻石', '超凡', '神话'],
  金铲铲之战: ['黑铁', '黄铜', '白银', '黄金', '铂金', '翡翠', '钻石', '大师', '宗师', '王者'],
  穿越火线: ['新锐', '精英', '专家', '大师', '宗师', '枪王', '枪王之王'],
  第五人格: ['一阶', '二阶', '三阶', '四阶', '五阶', '六阶', '巅峰七阶'],
  蛋仔派对: ['鹌鹑蛋', '鸡蛋', '鹅蛋', '恐龙蛋', '凤凰蛋', '无敌凤凰蛋'],
  暗区突围: ['新锐', '斥候', '精英', '专家', '大师', '暗区传说'],
  CS2: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'],
};

const PRICE_RANGES = ['0-50', '50-100', '100-200', '200+'];

export default function FilterBar({ onFilterChange, initialGame }: FilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [game, setGame] = useState(searchParams.get('game') || initialGame || '');
  const [rank, setRank] = useState(searchParams.get('rank') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || '');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const games = useMemo(() => Object.keys(GAME_RANKS), []);

  const currentRanks = useMemo(() => {
    if (!game) return [];
    return GAME_RANKS[game] || [];
  }, [game]);

  const updateURL = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const emitFilters = useCallback((overrides: Partial<{ game: string; rank: string; priceRange: string; search: string; sort: string }> = {}) => {
    const filters = {
      game: overrides.game ?? game,
      rank: overrides.rank ?? rank,
      priceRange: overrides.priceRange ?? priceRange,
      search: overrides.search ?? searchInput,
      sort: overrides.sort ?? sort,
    };
    onFilterChange(filters);
  }, [game, rank, priceRange, searchInput, sort, onFilterChange]);

  useEffect(() => {
    if (initialGame && initialGame !== game) {
      setGame(initialGame);
      setRank('');
      onFilterChange({ game: initialGame, rank: '', priceRange, search: searchInput, sort });
      updateURL({ game: initialGame, rank: '' });
    }
  }, [initialGame]);

  useEffect(() => {
    onFilterChange({ game, rank, priceRange, search: searchInput, sort });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleGameChange = (value: string) => {
    setGame(value);
    setRank('');
    updateURL({ game: value, rank: '' });
    onFilterChange({ game: value, rank: '', priceRange, search: searchInput, sort });
  };

  const handleRankChange = (value: string) => {
    setRank(value);
    updateURL({ rank: value });
    onFilterChange({ game, rank: value, priceRange, search: searchInput, sort });
  };

  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
    updateURL({ priceRange: value });
    onFilterChange({ game, rank, priceRange: value, search: searchInput, sort });
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    updateURL({ sort: value });
    onFilterChange({ game, rank, priceRange, search: searchInput, sort: value });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateURL({ q: value });
      onFilterChange({ game, rank, priceRange, search: value, sort });
    }, 300);
  };

  const handleReset = () => {
    setGame('');
    setRank('');
    setPriceRange('');
    setSearchInput('');
    setSort('');
    updateURL({ game: '', rank: '', priceRange: '', q: '', sort: '' });
    onFilterChange({ game: '', rank: '', priceRange: '', search: '', sort: '' });
  };

  const inputClasses = 'w-full px-3 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 border border-transparent focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors motion-reduce:transition-none';
  const selectClasses = 'select cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors motion-reduce:transition-none';

  return (
    <div className="card mb-8 sticky top-16 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/90 shadow-lg transition-shadow motion-reduce:transition-none">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">筛选条件</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">可组合筛选，快速定位心仪陪玩</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <div>
          <label htmlFor="filter-search" className="mb-2 block text-gray-700 dark:text-gray-300">搜索昵称</label>
          <input
            id="filter-search"
            type="text"
            name="search"
            autoComplete="off"
            spellCheck={false}
            className={inputClasses}
            placeholder="输入陪玩昵称…"
            aria-label="搜索陪玩昵称"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="filter-game" className="mb-2 block text-gray-700 dark:text-gray-300">游戏</label>
          <select
            id="filter-game"
            name="game"
            className={selectClasses}
            aria-label="选择游戏"
            value={game}
            onChange={(e) => handleGameChange(e.target.value)}
          >
            <option value="">全部游戏</option>
            {games.map((gameName) => (
              <option key={gameName} value={gameName}>
                {gameName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-rank" className="mb-2 block text-gray-700 dark:text-gray-300">段位</label>
          <select
            id="filter-rank"
            name="rank"
            className={`${selectClasses} ${!game ? 'opacity-50' : ''}`}
            aria-label="选择段位"
            value={rank}
            onChange={(e) => handleRankChange(e.target.value)}
            disabled={!game}
          >
            <option value="">全部段位</option>
            {currentRanks.map((rankName) => (
              <option key={rankName} value={rankName}>
                {rankName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-price" className="mb-2 block text-gray-700 dark:text-gray-300">价格范围</label>
          <select
            id="filter-price"
            name="priceRange"
            className={selectClasses}
            aria-label="选择价格范围"
            value={priceRange}
            onChange={(e) => handlePriceRangeChange(e.target.value)}
          >
            <option value="">全部价格</option>
            {PRICE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}元/小时
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-sort" className="mb-2 block text-gray-700 dark:text-gray-300">排序</label>
          <select
            id="filter-sort"
            name="sort"
            className={selectClasses}
            aria-label="选择排序方式"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="">默认排序</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
            <option value="rating">评分最高</option>
            <option value="orders">接单最多</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onClick={handleReset}
        >
          重置筛选
        </button>
      </div>
    </div>
  );
}
