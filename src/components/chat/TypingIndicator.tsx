'use client';

export default function TypingIndicator({ userName }: { userName: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 mb-2">
      <span className="text-xs text-gray-400 dark:text-gray-500">{userName} 正在输入</span>
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
