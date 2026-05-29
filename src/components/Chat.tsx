'use client';

import { useState, useEffect, useRef } from 'react';
import { getPusher, releasePusher } from '@/lib/pusher';
import { useUserStore } from '@/store/user';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatProps {
  companionId: string;
  companionName: string;
}

export default function Chat({ companionId, companionName }: ChatProps) {
  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载历史消息
  useEffect(() => {
    if (!user) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages?companionName=${encodeURIComponent(companionName)}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('加载聊天记录失败:', error);
      }
    };

    loadMessages();
  }, [user, companionName]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pusher 实时消息
  useEffect(() => {
    let pusher: ReturnType<typeof getPusher>;
    try {
      pusher = getPusher();
    } catch { return; }

    const channel = pusher.subscribe(`chat-${companionId}`);

    channel.bind('new-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.unbind('new-message');
      pusher.unsubscribe(`chat-${companionId}`);
      releasePusher();
    };
  }, [companionId]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 保存用户消息到数据库
      const saveResponse = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionName,
          role: 'user',
          content: userMessage.content,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('保存消息失败');
      }

      // 获取 AI 回复
      const aiResponse = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `你是${companionName}，一个专业的电竞陪玩。请用友好、专业的语气回复用户。` },
            ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage.content },
          ],
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const assistantContent = aiData.choices?.[0]?.message?.content || '抱歉，我暂时无法回复。';

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // 保存 AI 回复到数据库
        await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companionName,
            role: 'assistant',
            content: assistantContent,
          }),
        });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg">
      <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="m-0 text-base font-semibold">与 {companionName} 聊天</h3>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            开始和陪玩聊天吧
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 max-w-[80%] ${message.role === 'user' ? 'ml-auto' : 'mr-auto'}`}
          >
            <div
              className={`px-3 py-2 rounded-[18px] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-3 max-w-[80%] mr-auto">
            <div className="px-3 py-2 rounded-[18px] bg-gray-200 text-gray-800">
              <span className="animate-pulse">正在输入...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex p-3 border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={user ? '输入消息...' : '请先登录'}
          disabled={!user || loading}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-[20px] mr-2 disabled:bg-gray-100"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!user || loading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white border-0 rounded-[20px] cursor-pointer hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  );
}
