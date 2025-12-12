import { create } from "zustand";
import { type Space } from "../types/schemas";

interface SpaceState {
  space: Space | null;
  isLoading: boolean;
  error: string | null;
}

interface SpaceActions {
  setSpace: (space: Space | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

type SpaceStore = SpaceState & SpaceActions;

/**
 * Zustand store for managing current space state.
 * Used to share space data across components in space routes.
 * @example
 * ```tsx
 * const space = useSpaceStore((state) => state.space);
 * const { setSpace, clear } = useSpaceStore();
 * ```
 */
export const useSpaceStore = create<SpaceStore>()((set) => ({
  // State
  space: null,
  isLoading: false,
  error: null,

  // Actions
  setSpace: (space) => set({ space, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clear: () => set({ space: null, isLoading: false, error: null }),
}));
