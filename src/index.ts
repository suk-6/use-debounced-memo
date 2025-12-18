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

  // Update factory ref
  factoryRef.current = factory;

  // In non-lazy mode: compute value immediately
  // In lazy mode: skip computation (will compute in timeout)
  const eagerValue = useMemo(() => {
    return lazy ? undefined : factory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, lazy]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (lazy) {
        // lazy: true - execute factory when timeout ends
        setDebouncedValue(factoryRef.current());
      } else {
        // lazy: false - use the already computed eager value
        setDebouncedValue(eagerValue as T);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay, lazy]);

  return debouncedValue;
}

export default useDebouncedMemo;
