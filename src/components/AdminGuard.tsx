'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          const response = await fetch('/api/auth/current-user');
          if (response.ok) {
            const userData = await response.json();
            if (userData) {
              setUser(userData);
              if (userData.role === 'admin') {
                setLoading(false);
                return;
              }
            }
          }
        } else if (user.role === 'admin') {
          setLoading(false);
          return;
        }

        router.push('/');
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [user, setUser, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">验证权限中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
