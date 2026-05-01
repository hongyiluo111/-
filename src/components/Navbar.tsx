'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '@/store/user';
import { useRouter, usePathname } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth.actions';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

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
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    loadUser();
  }, [setUser]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, (currentScrollY / docHeight) * 100) : 0;
      setScrollProgress(progress);
      
      // 滑动时隐藏导航栏
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
      
      // 清除之前的定时器
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      // 停止滑动后显示导航栏
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        logout();
        router.push('/login');
      }
    } catch (error: unknown) {
      console.error('登出失败:', error instanceof Error ? error.message : '未知错误');
    }
  };

  return (
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
                <Link href="/" className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
                  首页
                </Link>
                <Link href="/find-companion" className={`nav-link ${isActive('/find-companion') ? 'nav-link-active' : ''}`}>
                  找陪玩
                </Link>
                <Link href="/become-companion" className={`nav-link ${isActive('/become-companion') ? 'nav-link-active' : ''}`}>
                  成为陪玩
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                user.role === 'admin' ? (
                  <>
                    <Link href="/admin/orders" className={`nav-link ${isActive('/admin/orders') ? 'nav-link-active' : ''}`}>
                      订单管理
                    </Link>
                    <Link href="/admin/companions" className={`nav-link ${isActive('/admin/companions') ? 'nav-link-active' : ''}`}>
                      陪玩管理
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="nav-link"
                    >
                      登出
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/orders" className={`nav-link ${isActive('/orders') ? 'nav-link-active' : ''}`}>
                      订单管理
                    </Link>
                    <Link href="/profile" className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}>
                      个人中心
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="nav-link"
                    >
                      登出
                    </button>
                  </>
                )
              ) : (
                <>
                  <Link href="/login" className="nav-link">
                    登录
                  </Link>
                  <Link href="/register" className="nav-link">
                    注册
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
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
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
            <Link href="/" className={`block nav-link ${isActive('/') ? 'nav-link-active' : ''}`}>
              首页
            </Link>
            <Link href="/find-companion" className={`block nav-link ${isActive('/find-companion') ? 'nav-link-active' : ''}`}>
              找陪玩
            </Link>
            <Link href="/become-companion" className={`block nav-link ${isActive('/become-companion') ? 'nav-link-active' : ''}`}>
              成为陪玩
            </Link>
            {user ? (
              user.role === 'admin' ? (
                <>
                  <Link href="/admin/orders" className={`block nav-link ${isActive('/admin/orders') ? 'nav-link-active' : ''}`}>
                    订单管理
                  </Link>
                  <Link href="/admin/companions" className={`block nav-link ${isActive('/admin/companions') ? 'nav-link-active' : ''}`}>
                    陪玩管理
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block nav-link"
                  >
                    登出
                  </button>
                </>
              ) : (
                <>
                  <Link href="/orders" className={`block nav-link ${isActive('/orders') ? 'nav-link-active' : ''}`}>
                    订单管理
                  </Link>
                  <Link href="/profile" className={`block nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}>
                    个人中心
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block nav-link"
                  >
                    登出
                  </button>
                </>
              )
            ) : (
              <>
                <Link href="/login" className="block nav-link">
                  登录
                </Link>
                <Link href="/register" className="block nav-link">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      )}


    </nav>
  );
}
