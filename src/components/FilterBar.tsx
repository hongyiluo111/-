'use client';

import { useEffect, useMemo, useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: { game: string; rank: string; priceRange: string }) => void;
  initialGame?: string;
}

const GAME_RANKS: Record<string, string[]> = {
  三角洲行动: ['新兵', '老兵', '精英', '高手', '专家', '大师', '三角洲巅峰'],
  王者荣耀: ['倔强青铜', '秩序白银', '荣耀黄金', '尊贵铂金', '永恒钻石', '至尊星耀', '最强王者', '无双王者', '荣耀王者', '传奇王者'],
  英雄联盟: ['坚韧黑铁', '英勇黄铜', '不屈白银', '荣耀黄金', '华贵铂金', '璀璨钻石', '超凡大师', '傲世宗师', '最强王者'],
  英雄联盟手游: ['黑铁', '黄铜', '白银', '黄金', '铂金', '流光翡翠', '钻石', '大师', '宗师', '王者'],
  和平精英: ['热血青铜', '不屈白银', '英勇黄金', '坚韧铂金', '不朽星钻', '荣耀皇冠', '超级王牌', '无敌战神'],
  VALORANT: ['黑铁', '青铜', '白银', '黄金', '铂金', '钻石', '超凡', '神话'],
  金铲铲之战: ['黑铁', '黄铜', '白银', '黄金', '铂金', '翡翠', '钻石', '大师', '宗师', '王者'],
  穿越火线: ['新锐', '精英', '专家', '大师', '宗师', '枪王', '枪王之王'],
  第五人格: ['一阶', '二阶', '三阶', '四阶', '五阶', '六阶', '巅峰七阶'],
  蛋仔派对: ['鹌鹑蛋', '鸡蛋', '鹅蛋', '恐龙蛋', '凤凰蛋', '无敌凤凰蛋'],
  暗区突围: ['新锐', '斥候', '精英', '专家', '大师', '暗区传说'],
  CS2: ['D', 'C', 'B', 'A', 'S', 'SS', 'SSS'],
};

const PRICE_RANGES = ['0-50', '50-100', '100-200', '200+'];

export default function FilterBar({ onFilterChange, initialGame }: FilterBarProps) {
  const [game, setGame] = useState(initialGame || '');
  const [rank, setRank] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    if (initialGame) {
      setGame(initialGame);
    }
  }, [initialGame]);

  const games = useMemo(() => Object.keys(GAME_RANKS), []);

  const currentRanks = useMemo(() => {
    if (!game) {
      return [];
    }

    return GAME_RANKS[game] || [];
  }, [game]);

  useEffect(() => {
    setRank('');
  }, [game]);

  const handleFilter = () => {
    onFilterChange({ game, rank, priceRange });
  };

  const handleReset = () => {
    setGame('');
    setRank('');
    setPriceRange('');
    onFilterChange({ game: '', rank: '', priceRange: '' });
  };

  return (
    <div className="card mb-8 border border-white/90 shadow-lg">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">筛选条件</h2>
        <p className="text-sm text-gray-500">可组合筛选，快速定位心仪陪玩</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-gray-700">游戏</label>
          <select className="select cursor-pointer" value={game} onChange={(e) => setGame(e.target.value)}>
            <option value="">全部游戏</option>
            {games.map((gameName) => (
              <option key={gameName} value={gameName}>
                {gameName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-gray-700">段位</label>
          <select
            className={`select cursor-pointer ${!game ? 'opacity-50' : ''}`}
            value={rank}
            onChange={(e) => setRank(e.target.value)}
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
          <label className="mb-2 block text-gray-700">价格范围</label>
          <select className="select cursor-pointer" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">全部价格</option>
            {PRICE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}元/小时
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={handleFilter} className="btn btn-primary">
          筛选
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
      </div>
    </div>
  );
}
