'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUserStore } from '@/store/user';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

interface ChatModalProps {
  receiverId: string;
  receiverName: string;
  onClose: () => void;
}

export default function ChatModal({ receiverId, receiverName, onClose }: ChatModalProps) {
  const { user } = useUserStore();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat/messages?receiverId=${receiverId}`);
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.messages || []);
      }
    } catch (loadError) {
      console.error('加载聊天记录失败:', loadError);
    }
  }, [receiverId]);

  useEffect(() => {
    loadHistory();

    // 每 3 秒轮询新消息
    pollingRef.current = setInterval(loadHistory, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [loadHistory]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading || !user) return;

    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content: trimmed }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex h-[500px] w-96 flex-col rounded-lg bg-white">
        <div className="flex items-center justify-between rounded-t-lg bg-blue-600 p-4 text-white">
          <h3 className="font-semibold">与 {receiverName} 聊天</h3>
          <button onClick={onClose} className="text-2xl text-white hover:text-gray-200">
            ×
          </button>
        </div>

        <div className="flex-grow space-y-4 overflow-y-auto p-4">
          {chatHistory.length === 0 && (
            <p className="text-center text-sm text-gray-500">开始和 {receiverName} 聊天吧！</p>
          )}

          {chatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${msg.senderId === user?.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSend();
              }}
              placeholder={`给 ${receiverName} 发消息...`}
              className="flex-grow rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
