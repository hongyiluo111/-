'use client';

import { useState, useRef, useEffect } from 'react';

export default function AIService() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const newMessages: { role: 'user' | 'assistant'; content: string }[] = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          model: 'qwen-turbo',
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'API请求失败');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || '抱歉，我无法理解您的问题。';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('AI服务错误:', error);
      const errorMessage = error instanceof Error ? error.message : '网络连接失败';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `抱歉，AI服务暂时不可用。\n错误信息：${errorMessage}\n请检查网络连接或稍后再试。` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
      {/* 侧边AI助手按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center transition-all duration-300 ease-in-out z-50 ${
          isOpen
            ? 'w-12 h-12 rounded-full bg-blue-600 shadow-lg hover:bg-blue-700'
            : 'w-6 h-24 bg-blue-600 rounded-l-lg shadow-lg hover:bg-blue-700'
        }`}
        aria-label={isOpen ? '关闭AI服务' : '打开AI服务'}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <div className="text-white text-xs font-medium flex items-center justify-center h-full px-1">
            AI助手
          </div>
        )}
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">AI助手</h3>
          </div>
          
          <div
            ref={chatRef}
            className="flex-grow p-4 overflow-y-auto space-y-4"
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-gray-500">正在思考...</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="请输入您的问题..."
                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
