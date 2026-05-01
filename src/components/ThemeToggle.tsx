'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark' | 'system';

const icons = {
  light: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  dark: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

const labels = {
  light: '日间',
  dark: '夜间',
  system: '系统',
};

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('system');
  const themeRef = useRef<Theme>('system');
  const initialized = useRef(false);

  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const applyTheme = useCallback((t: Theme) => {
    const resolved = t === 'system' ? getSystemTheme() : t;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [getSystemTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    themeRef.current = t;
    localStorage.setItem('theme', t);
    applyTheme(t);
  }, [applyTheme]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const saved = localStorage.getItem('theme') as Theme | null;
    const initial = saved || 'system';
    setThemeState(initial);
    themeRef.current = initial;
    applyTheme(initial);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (themeRef.current === 'system') applyTheme('system');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [applyTheme]);

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
      {(['light', 'dark', 'system'] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            theme === t
              ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          aria-label={`切换到${labels[t]}模式`}
        >
          {icons[t]}
          <span className="hidden sm:inline">{labels[t]}</span>
        </button>
      ))}
    </div>
  );
}
