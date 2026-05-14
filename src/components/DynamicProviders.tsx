'use client';

import dynamic from 'next/dynamic';

const AIService = dynamic(() => import('./AIService'), { ssr: false });
const MobileTabBar = dynamic(() => import('./MobileTabBar'), { ssr: false });

export default function DynamicProviders() {
  return (
    <>
      <AIService />
      <MobileTabBar />
    </>
  );
}
