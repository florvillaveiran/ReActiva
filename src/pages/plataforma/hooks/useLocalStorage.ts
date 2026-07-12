import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * useLocalStorage – sync a state value with localStorage.
 * It stores the JSON stringified version and parses on load.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage key', key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const serialized = JSON.stringify(storedValue);
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.warn('Error writing localStorage key', key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
