import { IAuth } from "@/apis/auth/interfaces";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: IAuth | null;
  isAuth: boolean;
  setUser: (user: IAuth | null) => void;
  logout: () => void;
  hydrate: () => void; // Để support hydration
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      setUser: (user) => set({ user, isAuth: !!user }),
      logout: () => set({ user: null, isAuth: false }),
      hydrate: () => {},
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuth: state.isAuth,
      }),
    },
  ),
);
