import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        setAuthState('authenticated');
        return;
      }

      try {
        const response = await fetch('/api/auth/current-user', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            setUser(userData);
            setAuthState('authenticated');
            return;
          }
        }
      } catch {
        // ignore
      }

      setAuthState('unauthenticated');
      if (requireAuth) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [user, setUser, router, requireAuth]);

  return { authState, user, isLoading: authState === 'loading', isAuthenticated: authState === 'authenticated' };
}
