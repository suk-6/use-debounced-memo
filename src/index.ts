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

  // Initialize state based on lazy mode
  const [debouncedValue, setDebouncedValue] = useState<T>(() => {
    // In lazy mode, we can return undefined initially, but that changes the type
    // So we still need to call factory() once for the initial value
    return factory();
  });
  
  const timeoutRef = useRef<number>();
  const factoryRef = useRef(factory);

  // Update factory ref
  factoryRef.current = factory;

  // In non-lazy mode: compute value immediately with useMemo
  // In lazy mode: create a dependency trigger without computing
  const memoizedValue = useMemo(() => {
    if (lazy) {
      // In lazy mode, return an empty object as a signal
      // Each deps change creates a new object reference
      return {} as T;
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
      if (lazy) {
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
  }, [memoizedValue, delay, lazy]);

  return debouncedValue;
}

export default useDebouncedMemo;
