'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '提交失败');
      }

      setMessage(data.message || '重置链接已发送，请检查邮箱。');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary to-accent px-4 py-12 text-white">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">找回密码</h1>
          <p className="mt-2 opacity-90">输入注册邮箱，我们会为你发送密码重置说明</p>
        </div>
      </div>

      <div className="container mx-auto flex justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h2 className="mb-6 text-2xl font-semibold">重置密码</h2>

            {message && <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-3 text-green-700">{message}</div>}
            {error && <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  邮箱
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入注册邮箱"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '提交中...' : '发送重置邮件'}
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
