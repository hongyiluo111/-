'use client';

import { useEffect, useState, useRef } from 'react';

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface ChatModalProps {
  companionName: string;
  onClose: () => void;
}

export default function ChatModal({ companionName, onClose }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/chat/messages?companionName=${encodeURIComponent(companionName)}`);
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data.messages || []);
        }
      } catch (loadError) {
        console.error('加载聊天记录失败:', loadError);
      }
    };
    loadHistory();
  }, [companionName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const saveMessage = async (role: string, content: string) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionName, role, content }),
      });
    } catch (saveError) {
      console.error('保存消息失败:', saveError);
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setMessage('');
    setError('');
    setLoading(true);

    await saveMessage('user', trimmed);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(({ role, content }) => ({ role, content })),
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || '发送消息失败，请稍后重试');
        return;
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || '抱歉，我暂时无法理解你的问题。',
        timestamp: Date.now(),
      };
      const updatedHistory = [...newHistory, assistantMessage];
      setChatHistory(updatedHistory);
      await saveMessage('assistant', assistantMessage.content);
    } catch (requestError) {
      console.error('发送消息失败:', requestError);
      setError('网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex h-[500px] w-96 flex-col rounded-lg bg-white">
        <div className="flex items-center justify-between rounded-t-lg bg-blue-600 p-4 text-white">
          <h3 className="font-semibold">与 {companionName} 聊天</h3>
          <button onClick={onClose} className="text-2xl text-white hover:text-gray-200">
            ×
          </button>
        </div>

        <div className="flex-grow space-y-4 overflow-y-auto p-4">
          {chatHistory.length === 0 && (
            <p className="text-center text-sm text-gray-500">开始和 {companionName} 聊天吧！</p>
          )}

          {chatHistory.map((msg, index) => (
            <div key={`${msg.timestamp}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 p-3">
                <p className="text-gray-500">正在输入...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded bg-red-50 p-2 text-center text-sm text-red-500">{error}</div>
          )}

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
              placeholder={`给 ${companionName} 发消息...`}
              className="flex-grow rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
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
