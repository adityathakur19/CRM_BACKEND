import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Business, Role, AuthState, LoginCredentials, RegisterData } from '@/types';
import { authApi } from '@/services/api';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setBusiness: (business: Business | null) => void;
  setRole: (role: Role | null) => void;
  setTokens: (accessToken: string, expiresAt: Date) => void;
  clearAuth: () => void;
  fetchCurrentUser: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  business: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  tokens: {
    accessToken: null,
    expiresAt: null,
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials.email, credentials.password);
          const { user, business, role, tokens } = response.data.data;
          
          set({
            user,
            business,
            role,
            tokens: {
              accessToken: tokens.accessToken,
              expiresAt: new Date(tokens.expiresAt),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          const { user, business, role, tokens } = response.data.data;
          
          set({
            user,
            business,
            role,
            tokens: {
              accessToken: tokens.accessToken,
              expiresAt: new Date(tokens.expiresAt),
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set(initialState);
          localStorage.removeItem('auth-storage');
        }
      },

      setUser: (user) => set({ user }),
      
      setBusiness: (business) => set({ business }),
      
      setRole: (role) => set({ role }),
      
      setTokens: (accessToken, expiresAt) => set({
        tokens: { accessToken, expiresAt },
      }),

      clearAuth: () => {
        set(initialState);
        localStorage.removeItem('auth-storage');
      },

      fetchCurrentUser: async () => {
        // Prevent concurrent requests
        const { isLoading } = get();
        if (isLoading) return;

        set({ isLoading: true });
        try {
          const response = await authApi.getMe();
          const { user, business, role } = response.data.data;
          set({ 
            user, 
            business, 
            role, 
            isLoading: false,
            isAuthenticated: true 
          });
        } catch (error) {
          console.error('Fetch current user error:', error);
          set({ isLoading: false });
          
          // Only clear auth on actual 401 unauthorized, not on network errors
          if (error.response?.status === 401) {
            get().clearAuth();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        tokens: state.tokens,
      }),
    }
  )
);