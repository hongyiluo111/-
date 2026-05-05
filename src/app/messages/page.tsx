'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import ChatModal from '@/components/ChatModal';

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  isFriend: boolean;
}

export default function MessagesPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{ userId: string; userName: string } | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }

    const fetchConversations = async () => {
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
    };

    fetchConversations();
    const i = setInterval(fetchConversations, 5000);
    return () => clearInterval(i);
  }, [user, router]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">消息</h1>
          <p className="mt-3 max-w-2xl text-white/90">查看和管理你的聊天对话。</p>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-white/90 bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">会话列表</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <svg className="mx-auto mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>暂无消息</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => setActiveChat({ userId: conv.userId, userName: conv.userName })}
                  className="flex items-center gap-4 py-4 px-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {conv.userName.charAt(0)}
                    </div>
                    {conv.unread > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                        {conv.unread > 9 ? '9+' : conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{conv.userName}</span>
                        {!conv.isFriend && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">临时会话</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(conv.lastTime).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeChat && (
        <ChatModal
          receiverId={activeChat.userId}
          receiverName={activeChat.userName}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
}
