'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/actions/auth.actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        setError((result.error as string) || '登录失败');
        return;
      }

      const response = await fetch('/api/auth/current-user');
      if (response.ok) {
        const userData = await response.json();
        if (userData) {
          setUser(userData);
        }
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent text-white py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">登录</h1>
          <p className="mt-3 max-w-2xl text-white/90">登录后可预约陪玩、查看订单和管理个人资料。</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md">
          <div className="card border border-white/90 p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">欢迎回来</h2>

            {error && <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    邮箱
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    密码
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                    记住我
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                    忘记密码？
                  </Link>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              还没有账号？{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-500">
                立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
