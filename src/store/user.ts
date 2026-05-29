import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'companion' | 'admin' | 'club_admin';
  status: string;
  avatar?: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isCompanion: () => boolean;
  isAdmin: () => boolean;
  isClubAdmin: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  isCompanion: () => {
    const { user } = get();
    return user?.role === 'companion' || user?.role === 'admin';
  },
  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin';
  },
  isClubAdmin: () => {
    const { user } = get();
    return user?.role === 'club_admin' || user?.role === 'admin';
  },
}));
