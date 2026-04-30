'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { allCompanions, type Companion } from '@/data/companions';
import BookingModal from './BookingModal';
import TiltCard from './TiltCard';
import MagneticButton from './MagneticButton';

const gameColors: Record<string, string> = {
  '三角洲行动': 'from-green-500 to-emerald-600',
  '王者荣耀': 'from-orange-500 to-red-500',
  '英雄联盟': 'from-blue-500 to-indigo-600',
  '英雄联盟手游': 'from-blue-400 to-purple-500',
  '和平精英': 'from-yellow-500 to-orange-500',
  'VALORANT': 'from-pink-500 to-rose-600',
  '金铲铲之战': 'from-teal-500 to-cyan-600',
  '穿越火线': 'from-gray-500 to-gray-700',
  '第五人格': 'from-amber-500 to-orange-600',
  '蛋仔派对': 'from-pink-400 to-purple-500',
  '暗区突围': 'from-yellow-600 to-amber-700',
  'CS2': 'from-orange-400 to-red-500',
};

function FeaturedCompanionCard({ companion }: { companion: Companion }) {
  const [showChat, setShowChat] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const gameColor = gameColors[companion.game] || 'from-primary to-accent';

  return (
    <>
      <TiltCard
        maxTilt={5}
        scale={1.015}
        className="card hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
      >
        <div className={`h-2 bg-gradient-to-r ${gameColor}`} />
        <div className="p-5">
          <div className="flex items-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary ring-offset-2">
                <Image
                  src={companion.avatar}
                  alt={companion.name}
                  width={64}
                  height={64}
                  sizes="64px"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" title="在线" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-800">{companion.name}</h3>
              <p className={`text-sm bg-gradient-to-r ${gameColor} bg-clip-text text-transparent font-medium`}>
                {companion.game} · {companion.rank}
              </p>
            </div>
          </div>
          <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">{companion.description}</p>
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary">💎{companion.price}</span>
              <span className="text-xs text-gray-400">/小时</span>
            </div>
            <div className="flex space-x-2">
              <MagneticButton
                onClick={() => setShowChat(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors magnetic-btn"
                strength={8}
              >
                聊天
              </MagneticButton>
              <MagneticButton
                onClick={() => setShowBooking(true)}
                className={`px-3 py-1.5 text-sm text-white rounded-lg bg-gradient-to-r ${gameColor} hover:shadow-md transition-all magnetic-btn`}
                strength={8}
              >
                预约
              </MagneticButton>
            </div>
          </div>
        </div>
      </TiltCard>

      {showChat && (
        <ChatModal companionName={companion.name} onClose={() => setShowChat(false)} />
      )}

      {showBooking && (
        <BookingModal companion={companion} onClose={() => setShowBooking(false)} />
      )}
    </>
  );
}

interface ChatModalProps {
  companionName: string;
  onClose: () => void;
}

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

function ChatModal({ companionName, onClose }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`/api/chat/messages?companionName=${encodeURIComponent(companionName)}`);
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data.messages || []);
        }
      } catch (e) {
        console.error('加载聊天记录失败:', e);
      }
    };
    loadHistory();
  }, [companionName]);

  const saveMessage = async (role: string, content: string) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionName, role, content }),
      });
    } catch (e) {
      console.error('保存消息失败:', e);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: message, timestamp: Date.now() };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setMessage('');
    setError('');
    setLoading(true);

    await saveMessage('user', message);

    try {
      const apiMessages = newHistory.map(({ role, content }) => ({ role, content }));
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = { role: 'assistant', content: data.choices[0]?.message?.content || '抱歉，我无法理解您的问题。', timestamp: Date.now() };
        const updatedHistory = [...newHistory, assistantMessage];
        setChatHistory(updatedHistory);
        await saveMessage('assistant', assistantMessage.content);
      } else {
        const errorData = await response.json();
        setError(errorData.error || '发送消息失败，请稍后重试');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setError('网络错误，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 h-[500px] flex flex-col">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="font-semibold">与 {companionName} 聊天</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {chatHistory.length === 0 && (
            <p className="text-gray-500 text-center text-sm">开始和 {companionName} 聊天吧！</p>
          )}
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-gray-500">正在输入...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`给 ${companionName} 发消息...`}
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSend} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCompanions() {
  const [featuredCompanions, setFeaturedCompanions] = useState<Companion[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const shuffled = [...allCompanions].sort(() => Math.random() - 0.5);
    setFeaturedCompanions(shuffled.slice(0, 8));
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">热门陪玩</h2>
        <p className="text-gray-500">来自各游戏的顶尖选手，为你提供最佳游戏体验</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredCompanions.map((companion) => (
          <FeaturedCompanionCard key={companion.id} companion={companion} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <MagneticButton
          as="a"
          href="/find-companion"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 magnetic-btn"
          strength={14}
        >
          查看更多陪玩
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </MagneticButton>
      </div>
    </div>
  );
}
