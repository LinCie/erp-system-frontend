"use client";

import { useEffect } from "react";
import { useSpaceStore } from "../store/use-space-store";
import { type Space } from "../types/schemas";

interface SpaceProviderProps {
  initialSpace: Space | null;
  children: React.ReactNode;
}

/**
 * Provider component that initializes space store with server-fetched data.
 * Should wrap space route content in the layout.
 * @param initialSpace - Space data fetched server-side
 * @param children - Child components
 */
export function SpaceProvider({ initialSpace, children }: SpaceProviderProps) {
  const setSpace = useSpaceStore((state) => state.setSpace);
  const clear = useSpaceStore((state) => state.clear);

  useEffect(() => {
    if (initialSpace) {
      setSpace(initialSpace);
    }

    return () => {
      clear();
    };
  }, [initialSpace, setSpace, clear]);

  return <>{children}</>;
}
