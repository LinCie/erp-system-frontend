import { create } from "zustand";

/**
 * Auth store state interface
 */
interface AuthState {
  /** Whether the user is currently authenticated */
  isAuthenticated: boolean;
}

/**
 * Auth store actions interface
 */
interface AuthActions {
  /** Sets the authentication state */
  setAuthenticated: (value: boolean) => void;
  /** Clears all authentication state */
  clearAuth: () => void;
}

/**
 * Combined auth store type
 */
type AuthStore = AuthState & AuthActions;

/**
 * Zustand store for managing client-side authentication state.
 * Provides reactive access to auth status without prop drilling.
 *
 * @example
 * ```tsx
 * const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
 * const { setAuthenticated, clearAuth } = useAuthStore();
 * ```
 *
 * Requirements: 7.1, 7.2, 7.3
 */
export const useAuthStore = create<AuthStore>()((set) => ({
  isAuthenticated: false,

  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),

  clearAuth: () => set({ isAuthenticated: false }),
}));
