'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('重置链接无效，缺少必要参数');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (!token || !email) {
      setError('重置链接无效');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '重置失败');
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '重置密码失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h2 className="text-2xl font-semibold mb-2">密码重置成功</h2>
          <p className="text-gray-500">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent px-4 py-12 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold font-display">重置密码</h1>
          <p className="mt-2 opacity-90">设置新密码后即可登录</p>
        </div>
      </div>

      <div className="container mx-auto flex justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h2 className="mb-6 text-2xl font-semibold">设置新密码</h2>

            {error && (
              <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !token || !email}>
                {loading ? '提交中...' : '重置密码'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              记起密码了？{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                返回登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
