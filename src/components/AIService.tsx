'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AIService() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: message.trim() }];
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
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'AI 服务暂时不可用');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || '我暂时没有生成有效回复，请稍后再试。';
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('AI 服务请求失败:', error);
      const errorMessage = error instanceof Error ? error.message : '网络或服务异常';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `AI 助手暂时无法响应：${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className={`fixed bottom-5 right-3 sm:bottom-auto sm:right-0 sm:top-1/2 sm:-translate-y-1/2 ${isOpen ? 'z-[60]' : 'z-50'}`}>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className={`flex items-center justify-center bg-blue-600 text-white shadow-lg transition-all duration-300 hover:bg-blue-700 ${
          isOpen
            ? 'h-12 w-12 rounded-full'
            : 'h-14 w-14 rounded-full sm:h-24 sm:w-7 sm:rounded-l-lg sm:rounded-r-none'
        }`}
        aria-label={isOpen ? '关闭 AI 助手' : '打开 AI 助手'}
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <>
            <Bot className="h-5 w-5 sm:hidden" aria-hidden="true" />
            <span className="hidden h-full items-center justify-center px-1 text-xs font-medium leading-tight [writing-mode:vertical-rl] sm:flex">
              AI助手
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 flex h-[70vh] flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-16 sm:top-1/2 sm:h-[min(28rem,calc(100vh-7rem))] sm:w-80 sm:-translate-y-1/2 sm:rounded-xl">
          <div className="flex items-center gap-2 bg-blue-600 px-4 py-3 text-white">
            <Bot className="h-5 w-5" aria-hidden="true" />
            <h3 className="font-semibold">AI 助手</h3>
          </div>

          <div ref={chatRef} className="flex-grow space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                可以询问陪玩推荐、游戏选择或订单流程。
              </p>
            )}

            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-lg p-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                  正在回复...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="输入你的问题..."
                className="min-w-0 flex-grow rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !message.trim()}
                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                aria-label="发送消息"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
