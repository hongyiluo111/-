'use client';

import { useState, useRef, useEffect } from 'react';

const EMOJI_CATEGORIES: Record<string, string[]> = {
  '常用': ['😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '🤗', '🤔', '😎', '🥺', '😢', '😭', '😤', '😡', '🤯', '😱', '🥳', '😴', '🤮', '🤡', '💀', '👻', '👍', '👎', '👏', '🙏', '💪', '❤️', '🔥', '⭐', '🎉', '💯', '✨'],
  '表情': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '🫥', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  '手势': ['👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
  '动物': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍'],
  '食物': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🫛', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🫘', '🥐', '🥖', '🍞', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣'],
  '游戏': ['🎮', '🕹️', '🎲', '🎰', '🧩', '🪄', '🎯', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂'],
};

const STORAGE_KEY = 'emoji-recent';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('常用');
  const [search, setSearch] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    const next = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, 24);
    setRecent(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const categoryNames = Object.keys(EMOJI_CATEGORIES);
  const displayEmojis = activeCategory === '常用' && recent.length > 0 && !search
    ? [...recent, ...EMOJI_CATEGORIES['常用'].filter((e) => !recent.includes(e))]
    : EMOJI_CATEGORIES[activeCategory] || [];

  const filteredEmojis = search
    ? Object.values(EMOJI_CATEGORIES).flat().filter((e, i, arr) => arr.indexOf(e) === i)
    : displayEmojis;

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-80 rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 z-50"
    >
      <div className="p-2 border-b border-gray-100 dark:border-gray-700">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索表情..."
          className="w-full rounded-lg bg-gray-50 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 scrollbar-hide">
        {categoryNames.map((name) => (
          <button
            key={name}
            onClick={() => { setActiveCategory(name); setSearch(''); }}
            className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeCategory === name
                ? 'bg-primary text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-48 overflow-y-auto scrollbar-hide">
        {filteredEmojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            onClick={() => handleSelect(emoji)}
            className="flex items-center justify-center h-9 w-full rounded-md text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
