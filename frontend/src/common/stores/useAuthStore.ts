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
      hydrate: () => {
        // Hook này dùng để restore state từ localStorage sau khi mount
        // Zustand tự động xử lý, nhưng ta có thể dùng cho custom logic nếu cần
      },
    }),
    {
      name: "auth-storage", // Key lưu trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuth: state.isAuth,
      }), // Chỉ lưu những state này
    },
  ),
);
