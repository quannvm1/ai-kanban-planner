import { create } from 'zustand';
import { UserProfile } from '@ai-kanban/shared-types';
import { apiClient } from './api-client';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: UserProfile | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => void;
  devLogin: (email?: string, name?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  isLoading: true,

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
    set({ token });
  },

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    try {
      const user = await apiClient.get('/auth/me');
      set({ user: user as unknown as UserProfile, token, isLoading: false });
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      set({ user: null, token: null, isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
    set({ user: null, token: null });
  },

  devLogin: async (email = 'developer@example.com', name = 'Pro Developer') => {
    const res: any = await apiClient.post('/auth/dev-login', { email, name });
    if (res?.accessToken) {
      get().setToken(res.accessToken);
      set({ user: res.user, isLoading: false });
    }
  },
}));
