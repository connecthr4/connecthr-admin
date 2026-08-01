import { useEffect, useState } from 'react';

const DEFAULT_DEBOUNCE_MS = 400;

/**
 * Returns a value that only updates after `delayMs` has passed without `value` changing.
 */
export function useDebounce<T>(value: T, delayMs: number = DEFAULT_DEBOUNCE_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}
