'use client';

import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
}

export default function Chat({ companionId }: { companionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // 初始化Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    });

    // 订阅聊天频道
    const channel = pusher.subscribe(`chat-${companionId}`);

    // 监听新消息
    channel.bind('new-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe(`chat-${companionId}`);
      pusher.disconnect();
    };
  }, [companionId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 这里应该调用API发送消息
    // 暂时模拟发送
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'current-user-id', // 实际应该从用户状态获取
      receiverId: companionId,
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[400px] border border-gray-200 rounded-lg">
      <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="m-0 text-base font-semibold">聊天</h3>
      </div>
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 max-w-[80%] ${message.senderId === 'current-user-id' ? 'ml-auto' : 'mr-auto'}`}
          >
            <div
              className={`px-3 py-2 rounded-[18px] ${
                message.senderId === 'current-user-id'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-3 border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-[20px] mr-2"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white border-0 rounded-[20px] cursor-pointer hover:bg-blue-600"
        >
          发送
        </button>
      </div>
    </div>
  );
}
