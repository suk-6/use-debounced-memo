import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Options for debounced memo
 */
export interface DebouncedMemoOptions {
  /** Debounce delay in milliseconds */
  delay: number;
  /** 
   * If false (default), factory runs immediately on deps change, but state update is debounced.
   * If true, both factory execution and state update are debounced.
   */
  lazy?: boolean;
}

/**
 * A hook that debounces a computed value
 * @param factory - A function that returns the memoized value
 * @param deps - Dependency array for the memo
 * @param options - Debounce delay (number) or options object with delay and lazy flag
 * @returns The debounced memoized value
 */
export function useDebouncedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: number | DebouncedMemoOptions = 300
): T {
  // Parse options
  const delay = typeof options === 'number' ? options : options.delay;
  const lazy = typeof options === 'object' && options.lazy === true;

  const [debouncedValue, setDebouncedValue] = useState<T>(() => factory());
  const timeoutRef = useRef<number>();
  const factoryRef = useRef(factory);
  const lazyRef = useRef(lazy);

  // Update refs
  factoryRef.current = factory;
  lazyRef.current = lazy;

  // In non-lazy mode: compute value immediately
  // In lazy mode: return a unique symbol to signal deps changed
  const memoizedValue = useMemo(() => {
    if (lazyRef.current) {
      // In lazy mode, return a signal to trigger effect
      return Symbol() as any;
    } else {
      // In non-lazy mode, compute the value
      return factory();
    }
  }, deps);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (lazyRef.current) {
        // lazy: true - execute factory when timeout ends
        setDebouncedValue(factoryRef.current());
      } else {
        // lazy: false - use the already computed memoized value
        setDebouncedValue(memoizedValue);
      }
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
