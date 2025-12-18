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
  const depsCounterRef = useRef(0);

  // Update factory ref
  factoryRef.current = factory;

  // Track dependency changes
  // In lazy mode: increment a counter (doesn't compute value)
  // In non-lazy mode: compute the value immediately
  const depsCounter = useMemo(() => {
    depsCounterRef.current++;
    return depsCounterRef.current;
  }, deps);

  const eagerValue = useMemo(() => {
    return lazy ? undefined : factory();
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
        // lazy: false - use the already computed value
        setDebouncedValue(eagerValue as T);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [depsCounter, delay]);

  return debouncedValue;
}

export default useDebouncedMemo;
