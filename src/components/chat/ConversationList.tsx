'use client';

import { useState } from 'react';
import { SkeletonList } from '@/components/Skeleton';

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isFriend: boolean;
  online?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (userId: string, userName: string) => void;
  loading?: boolean;
}

export default function ConversationList({ conversations, activeId, onSelect, loading }: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? conversations.filter((c) => c.userName.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索会话..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4"><SkeletonList count={6} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-gray-500">
            <svg className="mx-auto mb-3 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm">{search ? '未找到匹配的会话' : '暂无消息'}</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <div
              key={conv.userId}
              onClick={() => onSelect(conv.userId, conv.userName)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                activeId === conv.userId
                  ? 'bg-primary/5 dark:bg-primary/10 border-r-2 border-primary'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                  {conv.userName.charAt(0)}
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {conv.unread > 99 ? '99+' : conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">{conv.userName}</span>
                    {!conv.isFriend && (
                      <span className="shrink-0 text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">临时</span>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500 ml-2">
                    {new Date(conv.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
