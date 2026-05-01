'use client';

import { useState, useEffect } from 'react';

/**
 * 检测当前设备是否为桌面端（pointer: fine）
 * 结果缓存并通过事件监听响应变化
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(pointer: fine)');
    setIsDesktop(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}
