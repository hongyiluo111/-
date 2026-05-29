'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/user';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const { user, setUser, logout } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<{ sender: string; content: string } | null>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/current-user');
        if (response.ok) {
          const userData = await response.json();
          if (userData) setUser(userData);
        }
      } catch { /* ignore */ }
    };
    loadUser();
  }, [setUser]);

  // 心跳
  useEffect(() => {
    if (!user) return;
    const send = async () => {
      try { await fetch('/api/user/online', { method: 'POST', credentials: 'include' }); } catch { /* ignore */ }
    };
    send();
    const i = setInterval(send, 60000);
    return () => clearInterval(i);
  }, [user]);

  // 未读消息轮询 + toast 通知
  useEffect(() => {
    if (!user) return;
    let lastTimestamp = Date.now().toString();

    const checkUnread = async () => {
      try {
        const res = await fetch(`/api/chat/unread?after=${lastTimestamp}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.count > 0) {
            // 获取最新未读消息内容
            const convRes = await fetch('/api/chat/conversations', { credentials: 'include' });
            if (convRes.ok) {
              const convData = await convRes.json();
              const unread = convData.conversations?.reduce((sum: number, c: { unread: number }) => sum + c.unread, 0) || 0;
              setUnreadCount(unread);

              // Toast 通知（不在消息页面时）
              if (pathname !== '/messages' && data.count > 0) {
                const lastConv = convData.conversations?.[0];
                if (lastConv && lastConv.lastMessage) {
                  setToast({ sender: lastConv.userName, content: lastConv.lastMessage.slice(0, 30) });
                  if (toastTimeout.current) clearTimeout(toastTimeout.current);
                  toastTimeout.current = setTimeout(() => setToast(null), 4000);
                }
              }
            }
          }
        }
        lastTimestamp = Date.now().toString();
      } catch { /* ignore */ }
    };

    checkUnread();
    const i = setInterval(checkUnread, 5000);
    return () => clearInterval(i);
  }, [user, pathname]);

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (currentScrollY / docHeight) * 100) : 0;
      setScrollProgress(progress);
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsVisible(true), 1000);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      logout();
      window.location.href = '/login';
    } catch { /* ignore */ }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b border-white/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-primary to-secondary transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="mr-2 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">鸿一电竞</span>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  <Link href="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>首页</Link>
                  <Link href="/find-companion" className={`nav-link ${isActive('/find-companion') ? 'nav-link-active' : ''}`}>找陪玩</Link>
                  <Link href="/become-companion" className={`nav-link ${isActive('/become-companion') ? 'nav-link-active' : ''}`}>成为陪玩</Link>
                  <Link href="/clubs" className={`nav-link ${isActive('/clubs') ? 'nav-link-active' : ''}`}>俱乐部</Link>
                  <Link href="/rankings" className={`nav-link ${isActive('/rankings') ? 'nav-link-active' : ''}`}>排行榜</Link>
                  <Link href="/feed" className={`nav-link ${isActive('/feed') ? 'nav-link-active' : ''}`}>动态</Link>
                  {user && (user.role === 'companion' || user.role === 'admin') && (
                    <Link href="/companion/dashboard" className={`nav-link ${isActive('/companion') ? 'nav-link-active' : ''}`}>陪玩工作台</Link>
                  )}
                  {user && (user.role === 'club_admin' || user.role === 'admin') && (
                    <Link href="/clubs/create" className={`nav-link ${isActive('/clubs/create') ? 'nav-link-active' : ''}`}>俱乐部管理</Link>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:flex items-center space-x-3">
                {user ? (
                  user.role === 'admin' ? (
                    <>
                      <Link href="/admin/orders" className="nav-link p-2" title="订单管理">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </Link>
                      <Link href="/admin/companions" className="nav-link p-2" title="陪玩管理">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </Link>
                      {/* 设置 */}
                      <Link href="/settings" className="nav-link p-2" title="设置">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </Link>
                      <button onClick={handleLogout} className="nav-link p-2" title="登出">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* 消息按钮 */}
                      <Link href="/messages" className="nav-link relative p-2" title="消息">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      {/* 好友按钮 */}
                      <Link href="/friends" className="nav-link p-2" title="好友">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      </Link>
                      {/* 订单按钮 */}
                      <Link href="/orders" className="nav-link p-2" title="订单">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </Link>
                      {/* 个人中心 */}
                      <Link href="/profile" className="nav-link p-2" title="个人中心">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </Link>
                      {/* 设置 */}
                      <Link href="/settings" className="nav-link p-2" title="设置">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </Link>
                      {/* 登出 */}
                      <button onClick={handleLogout} className="nav-link p-2" title="登出">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <Link href="/login" className="nav-link">登录</Link>
                    <Link href="/register" className="nav-link">注册</Link>
                  </>
                )}
              </div>
              <div className="flex items-center md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 focus:outline-none">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className={`block nav-link ${isActive('/') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>首页</Link>
              <Link href="/find-companion" className={`block nav-link ${isActive('/find-companion') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>找陪玩</Link>
              <Link href="/become-companion" className={`block nav-link ${isActive('/become-companion') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>成为陪玩</Link>
              <Link href="/clubs" className={`block nav-link ${isActive('/clubs') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>俱乐部</Link>
              <Link href="/rankings" className={`block nav-link ${isActive('/rankings') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>排行榜</Link>
              <Link href="/feed" className={`block nav-link ${isActive('/feed') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>动态</Link>
              {user && (user.role === 'companion' || user.role === 'admin') && (
                <Link href="/companion/dashboard" className={`block nav-link ${isActive('/companion') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>陪玩工作台</Link>
              )}
              {user && (user.role === 'club_admin' || user.role === 'admin') && (
                <Link href="/clubs/create" className={`block nav-link ${isActive('/clubs/create') ? 'nav-link-active' : ''}`} onClick={() => setIsOpen(false)}>俱乐部管理</Link>
              )}
              {user ? (
                user.role === 'admin' ? (
                  <>
                    <Link href="/messages" className="block nav-link" onClick={() => setIsOpen(false)}>
                      消息{unreadCount > 0 && <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unreadCount}</span>}
                    </Link>
                    <Link href="/friends" className="block nav-link" onClick={() => setIsOpen(false)}>好友</Link>
                    <Link href="/admin/orders" className="block nav-link" onClick={() => setIsOpen(false)}>订单管理</Link>
                    <Link href="/admin/companions" className="block nav-link" onClick={() => setIsOpen(false)}>陪玩管理</Link>
                    <Link href="/settings" className="block nav-link" onClick={() => setIsOpen(false)}>设置</Link>
                    <button onClick={handleLogout} className="block nav-link w-full text-left">登出</button>
                  </>
                ) : (
                  <>
                    <Link href="/messages" className="block nav-link" onClick={() => setIsOpen(false)}>
                      消息{unreadCount > 0 && <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unreadCount}</span>}
                    </Link>
                    <Link href="/friends" className="block nav-link" onClick={() => setIsOpen(false)}>好友</Link>
                    <Link href="/orders" className="block nav-link" onClick={() => setIsOpen(false)}>订单管理</Link>
                    <Link href="/profile" className="block nav-link" onClick={() => setIsOpen(false)}>个人中心</Link>
                    <Link href="/settings" className="block nav-link" onClick={() => setIsOpen(false)}>设置</Link>
                    <button onClick={handleLogout} className="block nav-link w-full text-left">登出</button>
                  </>
                )
              ) : (
                <>
                  <Link href="/login" className="block nav-link" onClick={() => setIsOpen(false)}>登录</Link>
                  <Link href="/register" className="block nav-link" onClick={() => setIsOpen(false)}>注册</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Toast 通知 */}
      {toast && (
        <div className="fixed top-20 right-4 z-[60] animate-fade-in rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{toast.sender} 发来消息</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{toast.content}</p>
        </div>
      )}
    </>
  );
}
