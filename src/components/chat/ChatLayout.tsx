'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isFriend: boolean;
  online?: boolean;
}

export default function ChatLayout() {
  const { user } = useUserStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const [convRes, friendRes] = await Promise.all([
        fetch('/api/chat/conversations', { credentials: 'include' }),
        fetch('/api/friends', { credentials: 'include' }),
      ]);
      if (convRes.ok) {
        const convData = await convRes.json();
        const friendData = friendRes.ok ? await friendRes.json() : { friends: [] };
        const friendIds = new Set(friendData.friends?.map((f: { userId: string }) => f.userId) || []);
        setConversations(
          (convData.conversations || []).map((c: Conversation) => ({
            ...c,
            isFriend: friendIds.has(c.userId),
          }))
        );
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user, router, fetchConversations]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (!to) return;

    setActiveId(to);
    window.history.replaceState({}, '', '/messages');

    const conv = conversations.find((c) => c.userId === to);
    if (conv) {
      setActiveName(conv.userName);
    } else {
      fetch(`/api/user/profile?userId=${to}`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          setActiveName(data?.name || data?.userName || to);
        })
        .catch(() => setActiveName(to));
    }
  }, []);

  const handleSelect = (userId: string, userName: string) => {
    setActiveId(userId);
    setActiveName(userName);
  };

  const handleBack = () => {
    setActiveId(null);
    setActiveName('');
  };

  const handleNewMessage = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-lg">
      <div className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800`}>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          loading={loading}
        />
      </div>

      <div className={`${activeId ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gray-50 dark:bg-gray-900`}>
        {activeId ? (
          <ChatWindow
            partnerId={activeId}
            partnerName={activeName}
            onBack={handleBack}
            onNewMessage={handleNewMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <svg className="mx-auto mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>选择一个会话开始聊天</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
