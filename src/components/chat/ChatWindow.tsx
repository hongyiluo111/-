'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getPusher, releasePusher } from '@/lib/pusher';
import { useUserStore } from '@/store/user';
import { useToast } from '@/components/Toast';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import ImagePreview from './ImagePreview';

interface MessageData {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  duration: number | null;
  revoked: boolean;
  read: boolean;
  timestamp: number;
}

interface ChatWindowProps {
  partnerId: string;
  partnerName: string;
  onBack?: () => void;
  onNewMessage?: () => void;
}

export default function ChatWindow({ partnerId, partnerName, onBack, onNewMessage }: ChatWindowProps) {
  const { user } = useUserStore();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const markedRef = useRef<{ partnerId: string; messageCount: number } | null>(null);
  const isNearBottomRef = useRef(true);
  const loadMoreRef = useRef(false);

  const scrollToBottom = useCallback((smooth = true) => {
    chatEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  const loadMessages = useCallback(async (cursor?: string) => {
    try {
      const params = new URLSearchParams({ partnerId, limit: '30' });
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(`/api/chat/messages?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (cursor) {
          const container = chatContainerRef.current;
          const prevScrollHeight = container?.scrollHeight ?? 0;
          setMessages((prev) => [...data.messages, ...prev]);
          requestAnimationFrame(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - prevScrollHeight;
            }
          });
          setLoadingMore(false);
        } else {
          setMessages(data.messages);
          setHasMore(!!data.nextCursor);
        }
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [partnerId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    markedRef.current = null;
    isNearBottomRef.current = true;
    loadMoreRef.current = false;
    loadMessages();
  }, [partnerId, loadMessages]);

  useEffect(() => {
    if (loading) return;
    // 加载更多由 loadMessages 内部保持滚动位置，此处跳过
    if (loadMoreRef.current) {
      loadMoreRef.current = false;
      return;
    }
    // 只有用户在底部附近时才自动滚动，避免打断阅读历史
    if (isNearBottomRef.current) {
      scrollToBottom(messages.length > 1);
    }
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      const marked = markedRef.current;
      if (!marked || marked.partnerId !== partnerId || marked.messageCount < messages.length) {
        markedRef.current = { partnerId, messageCount: messages.length };
        fetch('/api/chat/mark-read', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partnerId }),
        }).catch(() => {});
      }
    }
  }, [partnerId, messages.length]);

  useEffect(() => {
    if (!user) return;

    let pusher: ReturnType<typeof getPusher>;
    try {
      pusher = getPusher();
    } catch { return; }

    const channelName = `chat-${[user.id, partnerId].sort().join('-')}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('new-message', (data: MessageData) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      onNewMessage?.();
    });

    channel.bind('message-revoked', (data: { messageId: string }) => {
      setMessages((prev) => prev.map((m) => m.id === data.messageId ? { ...m, revoked: true } : m));
    });

    channel.bind('messages-read', () => {
      setMessages((prev) => prev.map((m) => m.senderId === user.id ? { ...m, read: true } : m));
    });

    channel.bind('typing', (data: { userId: string }) => {
      if (data.userId === partnerId) {
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      releasePusher();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [user, partnerId, onNewMessage]);

  const handleSend = async (data: { content: string; type: string; fileUrl?: string; fileName?: string; fileSize?: number; duration?: number }) => {
    if (!user) return;
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: partnerId, ...data }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast('error', err.error || '发送失败');
      }
    } catch {
      showToast('error', '发送失败');
    }
  };

  const handleTyping = async () => {
    if (!user) return;
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: partnerId }),
      });
    } catch { /* ignore */ }
  };

  const handleRevoke = async (messageId: string) => {
    try {
      const res = await fetch('/api/chat/revoke', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, revoked: true } : m));
        showToast('info', '消息已撤回');
      } else {
        const data = await res.json();
        showToast('error', data.error || '撤回失败');
      }
    } catch {
      showToast('error', '撤回失败');
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && messages.length > 0) {
      setLoadingMore(true);
      loadMoreRef.current = true;
      loadMessages(messages[0].id);
    }
  };

  const handleScroll = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
    isNearBottomRef.current = distFromBottom < 100;
  }, []);

  const getDateLabel = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (msgDate.getTime() === today.getTime()) return '今天';
    if (msgDate.getTime() === yesterday.getTime()) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const shouldShowDate = (msg: MessageData, prevMsg: MessageData | undefined) => {
    if (!prevMsg) return true;
    const d1 = new Date(msg.timestamp);
    const d2 = new Date(prevMsg.timestamp);
    return d1.getFullYear() !== d2.getFullYear() || d1.getMonth() !== d2.getMonth() || d1.getDate() !== d2.getDate();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        {onBack && (
          <button onClick={onBack} className="md:hidden flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {partnerName.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">{partnerName}</h3>
        </div>
      </div>

      <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-3 relative">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center py-2 mb-2">
                <button onClick={handleLoadMore} disabled={loadingMore} className="text-xs text-primary hover:underline disabled:opacity-50">
                  {loadingMore ? '加载中...' : '加载更多消息'}
                </button>
              </div>
            )}
            {messages.length === 0 && (
              <div className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">
                开始和 {partnerName} 聊天吧
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={msg.id}>
                {shouldShowDate(msg, messages[idx - 1]) && (
                  <div className="flex items-center justify-center my-3">
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/50 px-3 py-0.5 rounded-full">
                      {getDateLabel(msg.timestamp)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isOwn={msg.senderId === user?.id}
                  onRevoke={handleRevoke}
                  onImageClick={(url) => setPreviewUrl(url)}
                />
              </div>
            ))}
            {typing && <TypingIndicator userName={partnerName} />}
          </>
        )}
        <div ref={chatEndRef} />

        {showScrollBtn && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-primary transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      <ChatInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!user}
        placeholder={`给 ${partnerName} 发消息...`}
      />

      {previewUrl && (
        <ImagePreview url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}
