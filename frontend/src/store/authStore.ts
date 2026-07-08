import { create } from "zustand";
import type { User } from "../types/auth";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage",
      // storage: createJSONStorage(()=> sessionStorage),
      // partialize: (state)=> ({user: state.user?.id}),
    },
  ),
);
