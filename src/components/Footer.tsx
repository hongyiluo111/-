'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <>
      {/* 返回顶部 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        aria-label="返回顶部"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <footer className="mt-16 border-t border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-14 text-white relative overflow-hidden">
        {/* 噪点纹理 */}
        <div className="noise-overlay opacity-[0.03]" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">鸿一电竞</h3>
              <p className="text-slate-300 mb-6">
                专业的电竞陪玩平台，连接游戏高手与玩家
              </p>
              {/* 社交图标 */}
              <div className="flex space-x-3">
                {[
                  { name: '微信', path: 'M8.5 2C5.46 2 3 4.46 3 7.5c0 1.68.76 3.18 1.96 4.22L4 14l2.5-1.28C7.47 13.1 8.47 13.3 9.5 13.3c.17 0 .33 0 .5-.02C9.68 12.92 9.5 12.47 9.5 12c0-3.04 2.46-5.5 5.5-5.5.17 0 .33 0 .5.02C15.15 4.2 13.05 2 10.5 2h-2zM15 8c-2.76 0-5 2.24-5 5s2.24 5 5 5c.87 0 1.69-.22 2.41-.6L20 18.5l-.78-2.34C20.14 15.17 20.8 14 20.8 13c0-2.76-2.24-5-5.8-5z' },
                  { name: '微博', path: 'M10.1 18.3c-3.6.4-6.7-1.3-6.9-3.7-.2-2.4 2.6-4.7 6.2-5.1 3.6-.4 6.7 1.3 6.9 3.7.2 2.4-2.6 4.7-6.2 5.1zM20.6 8.3c-.4-1.5-1.8-2.4-3.3-2.1l-.3.1c-.2.1-.3 0-.3-.2l.1-.3c.5-1.7-.5-3.5-2.3-4-1.8-.5-3.6.5-4.1 2.3l-.1.3c0 .2-.2.3-.3.2l-.3-.1c-1.5-.4-3.2.3-3.6 1.8' },
                  { name: 'B站', path: 'M6.72 3.06h10.56c.94 0 1.7.76 1.7 1.7v10.56c0 .94-.76 1.7-1.7 1.7H6.72c-.94 0-1.7-.76-1.7-1.7V4.76c0-.94.76-1.7 1.7-1.7zm1.77 4.41l2.1 2.67-2.1 2.67m3.42-5.34l2.1 2.67-2.1 2.67' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-all hover:bg-white/20 hover:text-white hover:scale-110"
                    aria-label={social.name}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2">
                {[
                  { label: '首页', href: '/' },
                  { label: '找陪玩', href: '/find-companion' },
                  { label: '成为陪玩', href: '/become-companion' },
                  { label: '订单管理', href: '/orders' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-300 hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">支持</h4>
              <ul className="space-y-2">
                {[
                  { label: '常见问题', href: '/faq' },
                  { label: '服务条款', href: '/terms' },
                  { label: '隐私政策', href: '/privacy' },
                  { label: '联系我们', href: '/contact' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-300 hover:text-white transition-colors hover:translate-x-1 inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">订阅动态</h4>
              <p className="text-slate-300 text-sm mb-3">获取最新活动和优惠信息</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  placeholder="输入邮箱"
                  className="flex-grow px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button
                  onClick={handleSubscribe}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
                >
                  订阅
                </button>
              </div>
              {subscribed && (
                <p className="text-green-400 text-xs mt-2">订阅成功！</p>
              )}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2 text-slate-400">联系我们</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>邮箱: contact@hongyi-esports.com</li>
                  <li>电话: 123-4567-8910</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700/70 pt-8 text-center text-slate-300">
            <p>© 2026 鸿一电竞. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
