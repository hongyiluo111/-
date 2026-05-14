'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">页面出错了</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
            抱歉，页面遇到了一个意外错误。请尝试刷新页面。
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
