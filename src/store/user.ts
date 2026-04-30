import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
