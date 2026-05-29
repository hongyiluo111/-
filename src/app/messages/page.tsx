'use client';

import ChatLayout from '@/components/chat/ChatLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function MessagesPage() {
  return (
    <div className="min-h-screen pt-16">
      <div className="h-[calc(100vh-4rem)] container mx-auto max-w-6xl px-4 py-4">
        <ErrorBoundary>
          <ChatLayout />
        </ErrorBoundary>
      </div>
    </div>
  );
}
