import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * A hook that debounces a computed value
 * @param factory - A function that returns the memoized value
 * @param deps - Dependency array for the memo
 * @param delay - Debounce delay in milliseconds
 * @returns The debounced memoized value
 */
export function useDebouncedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  delay: number = 300
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(() => factory());
  const timeoutRef = useRef<number>();

  const memoizedValue = useMemo(factory, deps);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(memoizedValue);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [memoizedValue, delay]);

  return debouncedValue;
}

export default useDebouncedMemo;
