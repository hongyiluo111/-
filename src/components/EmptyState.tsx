'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  const defaultIcon = (
    <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="mb-4">{icon || defaultIcon}</div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 font-display">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">{description}</p>}
      {(actionLabel && actionHref) && (
        <Link
          href={actionHref}
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-medium"
        >
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onAction && !actionHref) && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
