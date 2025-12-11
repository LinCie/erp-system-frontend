"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook that debounces a value by delaying updates until after a specified delay.
 * Useful for preventing excessive API calls or expensive computations on rapid input changes.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds before the value updates
 * @returns The debounced value that only updates after the delay has passed
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This effect only runs 300ms after the user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
